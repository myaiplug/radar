import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { CATALOG } from "./catalog";
import { sanitizeUrl } from "./url";
import { ensureEntitlement, loadAccess, redactLead } from "./access";
import {
  CHANNELS,
  STAGES,
  isStageId,
  type ChannelId,
  type DeskStats,
  type Draft,
  type Lead,
  type LeadInput,
  type Service,
  type StageId,
} from "./types";

type ServiceRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  blurb: string;
  rate_label: string;
  hunt_hint: string;
  sort_order: number;
  active: boolean;
};

type LeadRow = {
  id: number;
  name: string;
  company: string;
  role_title: string;
  contact: string;
  source: string;
  service_id: number | null;
  service_name: string | null;
  stage: string;
  value_usd: number;
  score: number;
  why: string;
  angle: string;
  next_action: string;
  follow_up_on: string | null;
  notes: string;
  post_url: string;
  post_quote: string;
  created_at: string;
  updated_at: string;
};

type DraftRow = {
  id: number;
  lead_id: number;
  channel: string;
  body: string;
  created_at: string;
};

function mapService(row: ServiceRow): Service {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    category: row.category as Service["category"],
    blurb: row.blurb,
    rateLabel: row.rate_label,
    huntHint: row.hunt_hint,
    sortOrder: Number(row.sort_order),
    active: Boolean(row.active),
  };
}

function mapLead(row: LeadRow): Lead {
  const stage = isStageId(row.stage) ? row.stage : "new";
  return {
    id: Number(row.id),
    name: row.name,
    company: row.company ?? "",
    roleTitle: row.role_title ?? "",
    contact: row.contact ?? "",
    source: row.source ?? "manual",
    serviceId: row.service_id == null ? null : Number(row.service_id),
    serviceName: row.service_name,
    stage,
    valueUsd: Number(row.value_usd ?? 0),
    score: Number(row.score ?? 50),
    why: row.why ?? "",
    angle: row.angle ?? "",
    nextAction: row.next_action ?? "",
    followUpOn: row.follow_up_on ?? null,
    notes: row.notes ?? "",
    postUrl: sanitizeUrl(row.post_url),
    postQuote: row.post_quote ?? "",
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    locked: false,
  };
}

function mapDraft(row: DraftRow): Draft {
  const channel = CHANNELS.some((c) => c.id === row.channel)
    ? (row.channel as ChannelId)
    : "dm";
  return {
    id: Number(row.id),
    leadId: Number(row.lead_id),
    channel,
    body: row.body,
    createdAt: String(row.created_at ?? ""),
  };
}

const LEAD_SELECT = `
  l.id,
  l.name,
  l.company,
  l.role_title,
  l.contact,
  l.source,
  l.service_id,
  s.name as service_name,
  l.stage,
  l.value_usd,
  l.score,
  l.why,
  l.angle,
  l.next_action,
  l.follow_up_on::text as follow_up_on,
  l.notes,
  l.post_url,
  l.post_quote,
  l.created_at::text as created_at,
  l.updated_at::text as updated_at
`;

async function seedServices(userId: string) {
  const sql = await getSql();
  const existing = await sql<{ id: number }>`
    select id from services where user_id = ${userId} limit 1
  `;
  if (existing.length > 0) return;
  for (let i = 0; i < CATALOG.length; i += 1) {
    const entry = CATALOG[i];
    await sql`
      insert into services (
        user_id, slug, name, category, blurb, rate_label, hunt_hint, sort_order, active
      ) values (
        ${userId},
        ${entry.slug},
        ${entry.name},
        ${entry.category},
        ${entry.blurb},
        ${entry.rateLabel},
        ${entry.huntHint},
        ${i},
        true
      )
    `;
  }
}

export const bootstrapDesk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await seedServices(context.userId);
    await ensureEntitlement(context.userId);
    return { ok: true as const };
  });

export const listServices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await seedServices(context.userId);
    await ensureEntitlement(context.userId);
    const sql = await getSql();
    const rows = await sql<ServiceRow>`
      select id, slug, name, category, blurb, rate_label, hunt_hint, sort_order, active
      from services
      where user_id = ${context.userId}
      order by sort_order asc, id asc
    `;
    return rows.map(mapService);
  });

export const updateService = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; rateLabel?: string; active?: boolean; blurb?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      `update services
       set
         rate_label = coalesce($3, rate_label),
         blurb = coalesce($4, blurb),
         active = coalesce($5, active)
       where id = $1 and user_id = $2`,
      [
        data.id,
        context.userId,
        data.rateLabel ?? null,
        data.blurb ?? null,
        typeof data.active === "boolean" ? data.active : null,
      ],
    );
    return { ok: true as const };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await seedServices(context.userId);
    const sql = await getSql();
    const access = await loadAccess(context.userId);
    const list = await sql.query<LeadRow>(
      `select ${LEAD_SELECT}
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.user_id = $1
       order by
         case l.stage
           when 'negotiating' then 0
           when 'pitched' then 1
           when 'researching' then 2
           when 'new' then 3
           when 'won' then 4
           else 5
         end,
         l.updated_at desc`,
      [context.userId],
    );
    return list.map((row) => redactLead(mapLead(row), access));
  });

export const getLead = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const access = await loadAccess(context.userId);
    const rows = await sql.query<LeadRow>(
      `select ${LEAD_SELECT}
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`,
      [id, context.userId],
    );
    return rows[0] ? redactLead(mapLead(rows[0]), access) : null;
  });

export type { LeadInput };

export const createLead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: LeadInput) => input)
  .handler(async ({ context, data }) => {
    const name = data.name.trim();
    if (!name) throw new Error("Name is required");
    const access = await loadAccess(context.userId);
    if (!access.canSave) {
      if (access.dark) throw new Error("Your leads went dark. Unlock $5 to bring them back.");
      throw new Error("Free desk holds 2 leads. Unlock $5 to keep the rest.");
    }
    const sql = await getSql();
    const stage = data.stage && isStageId(data.stage) ? data.stage : "new";
    const rows = await sql.query<{ id: number }>(
      `insert into leads (
        user_id, name, company, role_title, contact, source, service_id, stage,
        value_usd, score, why, angle, next_action, follow_up_on, notes, post_url, post_quote
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      ) returning id`,
      [
        context.userId,
        name,
        data.company?.trim() ?? "",
        data.roleTitle?.trim() ?? "",
        data.contact?.trim() ?? "",
        data.source?.trim() || "manual",
        data.serviceId ?? null,
        stage,
        Math.max(0, Math.round(data.valueUsd ?? 0)),
        Math.min(100, Math.max(0, Math.round(data.score ?? 50))),
        data.why?.trim() ?? "",
        data.angle?.trim() ?? "",
        data.nextAction?.trim() ?? "",
        data.followUpOn || null,
        data.notes?.trim() ?? "",
        sanitizeUrl(data.postUrl),
        data.postQuote?.trim() ?? "",
      ],
    );
    const id = Number(rows[0]?.id);
    const leadRows = await sql.query<LeadRow>(
      `select ${LEAD_SELECT}
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`,
      [id, context.userId],
    );
    return mapLead(leadRows[0]);
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: LeadInput & { id: number }) => input)
  .handler(async ({ context, data }) => {
    const name = data.name.trim();
    if (!name) throw new Error("Name is required");
    const access = await loadAccess(context.userId);
    if (access.dark) throw new Error("Your leads went dark. Unlock $5 to edit them.");
    const sql = await getSql();
    const stage = data.stage && isStageId(data.stage) ? data.stage : "new";
    await sql.query(
      `update leads set
        name = $3,
        company = $4,
        role_title = $5,
        contact = $6,
        source = $7,
        service_id = $8,
        stage = $9,
        value_usd = $10,
        score = $11,
        why = $12,
        angle = $13,
        next_action = $14,
        follow_up_on = $15,
        notes = $16,
        post_url = $17,
        post_quote = $18,
        updated_at = now()
      where id = $1 and user_id = $2`,
      [
        data.id,
        context.userId,
        name,
        data.company?.trim() ?? "",
        data.roleTitle?.trim() ?? "",
        data.contact?.trim() ?? "",
        data.source?.trim() || "manual",
        data.serviceId ?? null,
        stage,
        Math.max(0, Math.round(data.valueUsd ?? 0)),
        Math.min(100, Math.max(0, Math.round(data.score ?? 50))),
        data.why?.trim() ?? "",
        data.angle?.trim() ?? "",
        data.nextAction?.trim() ?? "",
        data.followUpOn || null,
        data.notes?.trim() ?? "",
        sanitizeUrl(data.postUrl),
        data.postQuote?.trim() ?? "",
      ],
    );
    const leadRows = await sql.query<LeadRow>(
      `select ${LEAD_SELECT}
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`,
      [data.id, context.userId],
    );
    return leadRows[0] ? mapLead(leadRows[0]) : null;
  });

export const setLeadStage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; stage: StageId }) => input)
  .handler(async ({ context, data }) => {
    if (!isStageId(data.stage)) throw new Error("Invalid stage");
    const access = await loadAccess(context.userId);
    if (access.dark) throw new Error("Your leads went dark. Unlock $5 to move them.");
    const sql = await getSql();
    await sql`
      update leads
      set stage = ${data.stage}, updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from drafts where lead_id = ${id} and user_id = ${context.userId}`;
    await sql`delete from leads where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const getDeskStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DeskStats> => {
    await seedServices(context.userId);
    const sql = await getSql();
    const counts = await sql<{ stage: string; count: number }>`
      select stage, count(*)::int as count
      from leads
      where user_id = ${context.userId}
      group by stage
    `;
    const money = await sql<{ pipeline: number; booked: number }>`
      select
        coalesce(sum(case when stage not in ('won','lost') then value_usd else 0 end), 0)::int as pipeline,
        coalesce(sum(case when stage = 'won' then value_usd else 0 end), 0)::int as booked
      from leads
      where user_id = ${context.userId}
    `;
    const due = await sql<{ count: number }>`
      select count(*)::int as count
      from leads
      where user_id = ${context.userId}
        and follow_up_on is not null
        and follow_up_on <= current_date
        and stage not in ('won','lost')
    `;
    const byStage = STAGES.map((s) => ({
      stage: s.id,
      count: Number(counts.find((c) => c.stage === s.id)?.count ?? 0),
    }));
    const openCount = byStage
      .filter((s) => s.stage !== "won" && s.stage !== "lost")
      .reduce((n, s) => n + s.count, 0);
    return {
      openCount,
      dueCount: Number(due[0]?.count ?? 0),
      bookedCount: byStage.find((s) => s.stage === "won")?.count ?? 0,
      pipelineUsd: Number(money[0]?.pipeline ?? 0),
      bookedUsd: Number(money[0]?.booked ?? 0),
      byStage,
    };
  });

export const listDrafts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((leadId: number) => leadId)
  .handler(async ({ context, data: leadId }) => {
    const access = await loadAccess(context.userId);
    if (!access.canOutreach) return [];
    const sql = await getSql();
    const rows = await sql<DraftRow>`
      select id, lead_id, channel, body, created_at::text as created_at
      from drafts
      where user_id = ${context.userId} and lead_id = ${leadId}
      order by id desc
    `;
    return rows.map(mapDraft);
  });

export const saveDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { leadId: number; channel: ChannelId; body: string }) => input)
  .handler(async ({ context, data }) => {
    const access = await loadAccess(context.userId);
    if (!access.canOutreach) throw new Error("Pitch writer is on the full desk. Unlock $5.");
    const body = data.body.trim();
    if (!body) throw new Error("Draft is empty");
    const sql = await getSql();
    const owned = await sql<{ id: number }>`
      select id from leads where id = ${data.leadId} and user_id = ${context.userId}
    `;
    if (!owned[0]) throw new Error("Lead not found");
    const rows = await sql<DraftRow>`
      insert into drafts (user_id, lead_id, channel, body)
      values (${context.userId}, ${data.leadId}, ${data.channel}, ${body})
      returning id, lead_id, channel, body, created_at::text as created_at
    `;
    return mapDraft(rows[0]);
  });
