import { r as createServerFn } from "./ssr.mjs";
import { a as STAGES, l as isStageId, n as CHANNELS, o as authMiddleware } from "./types-ilZjrocH.mjs";
import { t as CATALOG } from "./catalog-CBLFz4-U.mjs";
import { r as getSql } from "./db-IMLPVCI2.mjs";
import { i as loadAccess, n as ensureEntitlement, s as redactLead } from "./access-Pgm3kykF.mjs";
import { s as sanitizeUrl } from "./url-CfsaWNtp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-DoTcUmo9.js
function mapService(row) {
	return {
		id: Number(row.id),
		slug: row.slug,
		name: row.name,
		category: row.category,
		blurb: row.blurb,
		rateLabel: row.rate_label,
		huntHint: row.hunt_hint,
		sortOrder: Number(row.sort_order),
		active: Boolean(row.active)
	};
}
function mapLead(row) {
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
		locked: false
	};
}
function mapDraft(row) {
	const channel = CHANNELS.some((c) => c.id === row.channel) ? row.channel : "dm";
	return {
		id: Number(row.id),
		leadId: Number(row.lead_id),
		channel,
		body: row.body,
		createdAt: String(row.created_at ?? "")
	};
}
var LEAD_SELECT = `
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
async function seedServices(userId) {
	const sql = await getSql();
	if ((await sql`
    select id from services where user_id = ${userId} limit 1
  `).length > 0) return;
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
var bootstrapDesk_createServerFn_handler = createServerRpc({
	id: "fd206e699af5081fb6a2f67cb243c39411dfabcd71293209e3a9060ac80a5346",
	name: "bootstrapDesk",
	filename: "src/lib/radar/server.ts"
}, (opts) => bootstrapDesk.__executeServer(opts));
var bootstrapDesk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(bootstrapDesk_createServerFn_handler, async ({ context }) => {
	await seedServices(context.userId);
	await ensureEntitlement(context.userId);
	return { ok: true };
});
var listServices_createServerFn_handler = createServerRpc({
	id: "e050bc866bded5e904f2676ff7035a43721ad60ae3291ebea8d938b3e90359bd",
	name: "listServices",
	filename: "src/lib/radar/server.ts"
}, (opts) => listServices.__executeServer(opts));
var listServices = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listServices_createServerFn_handler, async ({ context }) => {
	await seedServices(context.userId);
	await ensureEntitlement(context.userId);
	return (await (await getSql())`
      select id, slug, name, category, blurb, rate_label, hunt_hint, sort_order, active
      from services
      where user_id = ${context.userId}
      order by sort_order asc, id asc
    `).map(mapService);
});
var updateService_createServerFn_handler = createServerRpc({
	id: "21e90d9e82c4f854876e3ea68ebe3bb9cddc03353c792a2bfa1d3efff958b66d",
	name: "updateService",
	filename: "src/lib/radar/server.ts"
}, (opts) => updateService.__executeServer(opts));
var updateService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateService_createServerFn_handler, async ({ context, data }) => {
	await (await getSql()).query(`update services
       set
         rate_label = coalesce($3, rate_label),
         blurb = coalesce($4, blurb),
         active = coalesce($5, active)
       where id = $1 and user_id = $2`, [
		data.id,
		context.userId,
		data.rateLabel ?? null,
		data.blurb ?? null,
		typeof data.active === "boolean" ? data.active : null
	]);
	return { ok: true };
});
var listLeads_createServerFn_handler = createServerRpc({
	id: "c4871a25376f4842d69dd2f2b10fffd5f6b0944b9cafdbf23468fa57f98fa0f1",
	name: "listLeads",
	filename: "src/lib/radar/server.ts"
}, (opts) => listLeads.__executeServer(opts));
var listLeads = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listLeads_createServerFn_handler, async ({ context }) => {
	await seedServices(context.userId);
	const sql = await getSql();
	const access = await loadAccess(context.userId);
	return (await sql.query(`select ${LEAD_SELECT}
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
         l.updated_at desc`, [context.userId])).map((row) => redactLead(mapLead(row), access));
});
var getLead_createServerFn_handler = createServerRpc({
	id: "2f3d4b17f060458feab44451804953af46c208cca5c021787f6c7c3b44ec74a2",
	name: "getLead",
	filename: "src/lib/radar/server.ts"
}, (opts) => getLead.__executeServer(opts));
var getLead = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => id).handler(getLead_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	const access = await loadAccess(context.userId);
	const rows = await sql.query(`select ${LEAD_SELECT}
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`, [id, context.userId]);
	return rows[0] ? redactLead(mapLead(rows[0]), access) : null;
});
var createLead_createServerFn_handler = createServerRpc({
	id: "dc68e05a5c3d42faf42c03c7f886f515bd1f8a93cefd3c96e01334813ba0c4fb",
	name: "createLead",
	filename: "src/lib/radar/server.ts"
}, (opts) => createLead.__executeServer(opts));
var createLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createLead_createServerFn_handler, async ({ context, data }) => {
	const name = data.name.trim();
	if (!name) throw new Error("Name is required");
	const access = await loadAccess(context.userId);
	if (!access.canSave) {
		if (access.dark) throw new Error("Your leads went dark. Unlock $5 to bring them back.");
		throw new Error("Free desk holds 2 leads. Unlock $5 to keep the rest.");
	}
	const sql = await getSql();
	const stage = data.stage && isStageId(data.stage) ? data.stage : "new";
	const rows = await sql.query(`insert into leads (
        user_id, name, company, role_title, contact, source, service_id, stage,
        value_usd, score, why, angle, next_action, follow_up_on, notes, post_url, post_quote
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      ) returning id`, [
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
		data.postQuote?.trim() ?? ""
	]);
	const id = Number(rows[0]?.id);
	return mapLead((await sql.query(`select ${LEAD_SELECT}
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`, [id, context.userId]))[0]);
});
var updateLead_createServerFn_handler = createServerRpc({
	id: "639e82983d4f8a641aa92b51d3d4a021c7bbc72f5cf8c82e590f95ab0bab76cb",
	name: "updateLead",
	filename: "src/lib/radar/server.ts"
}, (opts) => updateLead.__executeServer(opts));
var updateLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateLead_createServerFn_handler, async ({ context, data }) => {
	const name = data.name.trim();
	if (!name) throw new Error("Name is required");
	if ((await loadAccess(context.userId)).dark) throw new Error("Your leads went dark. Unlock $5 to edit them.");
	const sql = await getSql();
	const stage = data.stage && isStageId(data.stage) ? data.stage : "new";
	await sql.query(`update leads set
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
      where id = $1 and user_id = $2`, [
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
		data.postQuote?.trim() ?? ""
	]);
	const leadRows = await sql.query(`select ${LEAD_SELECT}
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`, [data.id, context.userId]);
	return leadRows[0] ? mapLead(leadRows[0]) : null;
});
var setLeadStage_createServerFn_handler = createServerRpc({
	id: "c2e118ea7d93a9efc429838946f6b7bba4bc5a222e3ed77c54588c5828abaf69",
	name: "setLeadStage",
	filename: "src/lib/radar/server.ts"
}, (opts) => setLeadStage.__executeServer(opts));
var setLeadStage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setLeadStage_createServerFn_handler, async ({ context, data }) => {
	if (!isStageId(data.stage)) throw new Error("Invalid stage");
	if ((await loadAccess(context.userId)).dark) throw new Error("Your leads went dark. Unlock $5 to move them.");
	await (await getSql())`
      update leads
      set stage = ${data.stage}, updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
var deleteLead_createServerFn_handler = createServerRpc({
	id: "5c10eee5b809ce7cbb26e90ba173fb78ea2426ef20aee0413687e465ad9be70a",
	name: "deleteLead",
	filename: "src/lib/radar/server.ts"
}, (opts) => deleteLead.__executeServer(opts));
var deleteLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(deleteLead_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	await sql`delete from drafts where lead_id = ${id} and user_id = ${context.userId}`;
	await sql`delete from leads where id = ${id} and user_id = ${context.userId}`;
	return { ok: true };
});
var getDeskStats_createServerFn_handler = createServerRpc({
	id: "0607d42f70886ccde202d466331640d7b6f16f1a5d497d5040c75339a1f230c7",
	name: "getDeskStats",
	filename: "src/lib/radar/server.ts"
}, (opts) => getDeskStats.__executeServer(opts));
var getDeskStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDeskStats_createServerFn_handler, async ({ context }) => {
	await seedServices(context.userId);
	const sql = await getSql();
	const counts = await sql`
      select stage, count(*)::int as count
      from leads
      where user_id = ${context.userId}
      group by stage
    `;
	const money = await sql`
      select
        coalesce(sum(case when stage not in ('won','lost') then value_usd else 0 end), 0)::int as pipeline,
        coalesce(sum(case when stage = 'won' then value_usd else 0 end), 0)::int as booked
      from leads
      where user_id = ${context.userId}
    `;
	const due = await sql`
      select count(*)::int as count
      from leads
      where user_id = ${context.userId}
        and follow_up_on is not null
        and follow_up_on <= current_date
        and stage not in ('won','lost')
    `;
	const byStage = STAGES.map((s) => ({
		stage: s.id,
		count: Number(counts.find((c) => c.stage === s.id)?.count ?? 0)
	}));
	return {
		openCount: byStage.filter((s) => s.stage !== "won" && s.stage !== "lost").reduce((n, s) => n + s.count, 0),
		dueCount: Number(due[0]?.count ?? 0),
		bookedCount: byStage.find((s) => s.stage === "won")?.count ?? 0,
		pipelineUsd: Number(money[0]?.pipeline ?? 0),
		bookedUsd: Number(money[0]?.booked ?? 0),
		byStage
	};
});
var listDrafts_createServerFn_handler = createServerRpc({
	id: "8bacdf9015750787f9ca40e76e59815e7a3812a70e3838c821bee5369883a95f",
	name: "listDrafts",
	filename: "src/lib/radar/server.ts"
}, (opts) => listDrafts.__executeServer(opts));
var listDrafts = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((leadId) => leadId).handler(listDrafts_createServerFn_handler, async ({ context, data: leadId }) => {
	if (!(await loadAccess(context.userId)).canOutreach) return [];
	return (await (await getSql())`
      select id, lead_id, channel, body, created_at::text as created_at
      from drafts
      where user_id = ${context.userId} and lead_id = ${leadId}
      order by id desc
    `).map(mapDraft);
});
var saveDraft_createServerFn_handler = createServerRpc({
	id: "db3c9a46e5a0cdc302397252592bf33f993b6707bb158fe36eff32a9c4fd8f3e",
	name: "saveDraft",
	filename: "src/lib/radar/server.ts"
}, (opts) => saveDraft.__executeServer(opts));
var saveDraft = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveDraft_createServerFn_handler, async ({ context, data }) => {
	if (!(await loadAccess(context.userId)).canOutreach) throw new Error("Pitch writer is on the full desk. Unlock $5.");
	const body = data.body.trim();
	if (!body) throw new Error("Draft is empty");
	const sql = await getSql();
	if (!(await sql`
      select id from leads where id = ${data.leadId} and user_id = ${context.userId}
    `)[0]) throw new Error("Lead not found");
	return mapDraft((await sql`
      insert into drafts (user_id, lead_id, channel, body)
      values (${context.userId}, ${data.leadId}, ${data.channel}, ${body})
      returning id, lead_id, channel, body, created_at::text as created_at
    `)[0]);
});
//#endregion
export { bootstrapDesk_createServerFn_handler, createLead_createServerFn_handler, deleteLead_createServerFn_handler, getDeskStats_createServerFn_handler, getLead_createServerFn_handler, listDrafts_createServerFn_handler, listLeads_createServerFn_handler, listServices_createServerFn_handler, saveDraft_createServerFn_handler, setLeadStage_createServerFn_handler, updateLead_createServerFn_handler, updateService_createServerFn_handler };
