import { r as createServerFn } from "./ssr.mjs";
import { i as SOURCES, o as authMiddleware } from "./types-ilZjrocH.mjs";
import { t as CATALOG } from "./catalog-CBLFz4-U.mjs";
import { r as getSql } from "./db-IMLPVCI2.mjs";
import { a as markHuntUsed, i as loadAccess } from "./access-Pgm3kykF.mjs";
import { c as uniqueUrls, i as matchPostUrl, l as urlKey, o as rankPostUrls, r as isPostUrl, s as sanitizeUrl, t as collectUrls } from "./url-CfsaWNtp.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-D6tlGM1T.js
var SOURCE_IDS = new Set(SOURCES.map((s) => s.id));
function extractJson(text) {
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	const raw = (fenced ? fenced[1] : text).trim();
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start === -1 || end === -1 || end <= start) throw new Error("Model did not return JSON");
	return JSON.parse(raw.slice(start, end + 1));
}
function outputText(body) {
	if (typeof body.output_text === "string" && body.output_text.trim()) return body.output_text;
	const chunks = [];
	const walk = (value) => {
		if (!value) return;
		if (typeof value === "string") return;
		if (Array.isArray(value)) {
			for (const item of value) walk(item);
			return;
		}
		if (typeof value === "object") {
			const rec = value;
			if (typeof rec.text === "string" && (rec.type === "output_text" || rec.type === "text")) chunks.push(rec.text);
			for (const nested of Object.values(rec)) walk(nested);
		}
	};
	walk(body.output);
	if (chunks.length) return chunks.join("\n");
	return body.choices?.[0]?.message?.content ?? "";
}
function citationUrls(body) {
	const raw = body.citations;
	const fromField = Array.isArray(raw) ? raw.map((item) => typeof item === "string" ? item : String(item?.url ?? "")) : [];
	return rankPostUrls(uniqueUrls([...fromField.map(sanitizeUrl).filter(Boolean), ...collectUrls(body)]));
}
async function chat(system, user, maxTokens) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) throw new Error("AI is not available in this environment");
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .7,
			max_tokens: maxTokens,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}]
		})
	});
	if (!res.ok) throw new Error(`xAI API error ${res.status}`);
	return (await res.json()).choices?.[0]?.message?.content ?? "";
}
async function huntSearch(prompt) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) throw new Error("AI is not available in this environment");
	const from = /* @__PURE__ */ new Date();
	from.setUTCDate(from.getUTCDate() - 14);
	const fromDate = from.toISOString().slice(0, 10);
	const res = await fetch("https://api.x.ai/v1/responses", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			tools: [{
				type: "x_search",
				from_date: fromDate
			}, { type: "web_search" }],
			input: prompt
		})
	});
	if (!res.ok) throw new Error(`xAI API error ${res.status}`);
	const body = await res.json();
	return {
		text: outputText(body),
		urls: citationUrls(body)
	};
}
function sourceFromUrl(url, fallback) {
	try {
		const host = new URL(url).hostname.replace(/^www\./, "");
		if (host === "x.com" || host === "twitter.com") return "x";
		if (host.includes("reddit.com")) return "reddit";
		if (host.includes("upwork.com")) return "upwork";
		if (host.includes("fiverr.com")) return "fiverr";
		if (host.includes("instagram.com")) return "instagram";
		return fallback;
	} catch {
		return fallback;
	}
}
function asProspect(raw, citations, used) {
	const name = String(raw.name ?? "").trim();
	if (!name) return null;
	const sourceRaw = String(raw.source ?? "other").toLowerCase();
	let source = SOURCE_IDS.has(sourceRaw) ? sourceRaw : "other";
	const estimatedValue = Math.max(0, Math.round(Number(raw.estimatedValue ?? 0) || 0));
	const score = Math.min(100, Math.max(1, Math.round(Number(raw.score ?? 50) || 50)));
	const postUrl = matchPostUrl(raw, citations, used);
	if (!isPostUrl(postUrl)) return null;
	used.add(urlKey(postUrl));
	source = sourceFromUrl(postUrl, source);
	return {
		name,
		company: String(raw.company ?? "").trim(),
		role: String(raw.role ?? "").trim(),
		contact: String(raw.contact ?? "").trim(),
		source,
		why: String(raw.why ?? "").trim(),
		angle: String(raw.angle ?? "").trim(),
		estimatedValue,
		nextAction: String(raw.nextAction ?? "").trim(),
		score,
		postUrl,
		postQuote: String(raw.postQuote ?? raw.quote ?? "").trim()
	};
}
var runHunt_createServerFn_handler = createServerRpc({
	id: "42a4b1412cb69cb69906ed8a5aaf6ff627d5ba4794fa7b9ebe0cd9f8a5fe4611",
	name: "runHunt",
	filename: "src/lib/radar/ai.ts"
}, (opts) => runHunt.__executeServer(opts));
var runHunt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runHunt_createServerFn_handler, async ({ context, data }) => {
	if (!process.env.XAI_API_KEY) return {
		ok: false,
		error: "AI hunt is not available right now."
	};
	const access = await loadAccess(context.userId);
	if (!access.canHunt) {
		if (access.dark) return {
			ok: false,
			error: "Your leads went dark. Unlock $5 to hunt again."
		};
		return {
			ok: false,
			error: "Free hunt is used. Unlock $5 for unlimited hunts."
		};
	}
	const sql = await getSql();
	let services;
	if (data.serviceIds.length) {
		const ids = data.serviceIds.filter((n) => Number.isFinite(n));
		if (ids.length === 0) return {
			ok: false,
			error: "Turn on at least one offer first."
		};
		const placeholders = ids.map((_, i) => `$${i + 2}`).join(",");
		services = await sql.query(`select name, blurb, hunt_hint, slug from services
         where user_id = $1 and id in (${placeholders})`, [context.userId, ...ids]);
	} else services = await sql`
        select name, blurb, hunt_hint, slug from services
        where user_id = ${context.userId} and active = true
        order by sort_order
        limit 4
      `;
	if (services.length === 0) return {
		ok: false,
		error: "Turn on at least one offer first."
	};
	const playbook = services.map((s) => {
		const places = CATALOG.find((c) => c.slug === s.slug)?.places.map((p) => `${p.name}: ${p.query}`).join(" | ") ?? "";
		return `- ${s.name}: ${s.hunt_hint || s.blurb}${places ? ` Search: ${places}` : ""}`;
	}).join("\n");
	const niche = data.niche.trim() || "independent artists, small labels, local brands, and founders";
	const geo = data.geo.trim() || "Louisville, KY plus remote US";
	const notes = data.notes.trim();
	const prompt = `You are a freelance lead researcher. Use X Search and Web Search to find REAL posts from the last 14 days where someone is asking to hire, collab, or needs these services.

Services:
${playbook}

Target niche: ${niche}
Geography: ${geo}
${notes ? `Extra brief: ${notes}` : ""}

Search X, Reddit, Upwork, and similar public posts. Return ONLY valid JSON:
{"prospects":[{"name":"","company":"","role":"","contact":"","source":"x|reddit|upwork|fiverr|instagram|local|other","why":"","angle":"","estimatedValue":0,"nextAction":"","score":50,"postUrl":"https://...","postQuote":""}]}

Rules:
- 6 prospects max. Each MUST be grounded in a real post you found.
- postUrl is the DIRECT permalink to that exact post or job so a human can open it, read every reply, and reply in thread. Copy it from search results. Never invent a URL or status id.
- Prefer x.com/{handle}/status/{id} or x.com/i/status/{id} for X, reddit.com/r/{sub}/comments/{id}/ for Reddit, and the job permalink for Upwork.
- Profiles, homepages, and search-result pages are not allowed.
- postQuote is 1-2 sentences copied from the post (the actual ask).
- If you cannot attach a real permalink, skip that prospect.
- Contact is a public handle, not an invented email.
- estimatedValue is a realistic one-job USD number for this freelancer.
- score 1-100 for fit and likelihood they buy in 14 days.`;
	try {
		const { text, urls } = await huntSearch(prompt);
		const parsed = extractJson(text);
		const list = Array.isArray(parsed.prospects) ? parsed.prospects : [];
		const used = /* @__PURE__ */ new Set();
		const prospects = list.filter((item) => !!item && typeof item === "object").map((item) => asProspect(item, urls, used)).filter((p) => p !== null && isPostUrl(p.postUrl)).slice(0, 8);
		if (prospects.length === 0) return {
			ok: false,
			error: "No live posts with a direct link. Try a tighter niche."
		};
		await markHuntUsed(context.userId);
		return {
			ok: true,
			prospects
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Hunt failed"
		};
	}
});
function asReply(raw) {
	const text = String(raw.text ?? raw.body ?? raw.quote ?? "").trim();
	if (!text) return null;
	return {
		author: String(raw.author ?? raw.name ?? raw.handle ?? "unknown").trim() || "unknown",
		text,
		url: sanitizeUrl(String(raw.url ?? raw.link ?? ""))
	};
}
var inspectThread_createServerFn_handler = createServerRpc({
	id: "0a9ff759a75cc3721ca28a268378b06debbd5c7ff7d1236baf0b43f15b09e391",
	name: "inspectThread",
	filename: "src/lib/radar/ai.ts"
}, (opts) => inspectThread.__executeServer(opts));
var inspectThread = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(inspectThread_createServerFn_handler, async ({ context, data }) => {
	if (!(await loadAccess(context.userId)).canInspect) return {
		ok: false,
		error: "Reply check is on the full desk. Unlock $5."
	};
	if (!process.env.XAI_API_KEY) return {
		ok: false,
		error: "Thread check is not available right now."
	};
	const postUrl = sanitizeUrl(data.postUrl);
	if (!isPostUrl(postUrl)) return {
		ok: false,
		error: "Need a direct post or job URL first."
	};
	const prompt = `Fetch this exact public post and the replies under it. A freelancer needs proof it is real and wants to see who already responded before pitching.

Post URL: ${postUrl}

Use X Search thread fetch and Web Search on that URL only. Return ONLY valid JSON:
{"quote":"","stillOpen":true,"note":"","replies":[{"author":"","text":"","url":""}]}

Rules:
- quote is the original post text, copied closely.
- replies are OTHER people answering the post, not the original poster. Max 8.
- url on a reply is the direct permalink to that reply if you have it.
- stillOpen is false if they already hired, closed it, or the job expired.
- note is one sentence: how crowded the thread is and whether a pitch still makes sense.
- Never invent replies or URLs. If you cannot see the thread, empty replies and say so in note.`;
	try {
		const { text } = await huntSearch(prompt);
		const parsed = extractJson(text);
		const replies = Array.isArray(parsed.replies) ? parsed.replies.filter((item) => !!item && typeof item === "object").map(asReply).filter((item) => item !== null).slice(0, 8) : [];
		return {
			ok: true,
			peek: {
				quote: String(parsed.quote ?? "").trim(),
				stillOpen: parsed.stillOpen !== false,
				note: String(parsed.note ?? "").trim(),
				replies
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Thread check failed"
		};
	}
});
var writeOutreach_createServerFn_handler = createServerRpc({
	id: "1588df446e5c6448b7c4ccbffb07be98437e17c2a1e3f3345a50a8c4283c4a75",
	name: "writeOutreach",
	filename: "src/lib/radar/ai.ts"
}, (opts) => writeOutreach.__executeServer(opts));
var writeOutreach = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(writeOutreach_createServerFn_handler, async ({ context, data }) => {
	if (!(await loadAccess(context.userId)).canOutreach) return {
		ok: false,
		error: "Pitch writer is on the full desk. Unlock $5."
	};
	if (!process.env.XAI_API_KEY) return {
		ok: false,
		error: "AI writing is not available right now."
	};
	const lead = (await (await getSql()).query(`select l.name, l.company, l.role_title, l.contact, l.source, l.why, l.angle,
              l.next_action, l.notes, l.post_url, l.post_quote,
              s.name as service_name, s.rate_label
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`, [data.leadId, context.userId]))[0];
	if (!lead) return {
		ok: false,
		error: "Lead not found"
	};
	const limits = {
		dm: "Max 70 words. No subject line. Feels like a human DM.",
		email: "Max 120 words. First line is a subject, then a blank line, then the body.",
		proposal: "Max 160 words. Upwork/Fiverr style: first sentence is the outcome, then process, then a question.",
		post: "Max 50 words. Public reply under their post. Helpful, not salesy. Reference what they asked in the post."
	};
	const system = `You write outreach for a Louisville-based multi-skilled creator (producer, engineer, designer, frontend).
Voice: direct, specific, calm. No hype. No em dash. No "I hope this finds you well". No "just circling back".
Never dump a full catalog. One offer, one proof, one next step.
Return ONLY valid JSON: {"body":"..."} `;
	const user = `Channel: ${data.channel}. ${limits[data.channel]}
Lead: ${lead.name}${lead.company ? ` at ${lead.company}` : ""}${lead.role_title ? `, ${lead.role_title}` : ""}
Contact/source: ${lead.contact || lead.source}
Source post: ${lead.post_url || "none"}
What they posted: ${lead.post_quote || "unknown"}
Offer: ${lead.service_name ?? "best matching skill"} ${lead.rate_label ? `(${lead.rate_label})` : ""}
Why they might buy: ${lead.why || "unknown"}
Angle: ${lead.angle || "lead with a sample"}
Next action on file: ${lead.next_action || "none"}
Notes: ${lead.notes || "none"}
${data.extra?.trim() ? `Writer notes: ${data.extra.trim()}` : ""}`;
	try {
		const parsed = extractJson(await chat(system, user, 700));
		const body = String(parsed.body ?? "").trim();
		if (!body) return {
			ok: false,
			error: "Writer returned nothing."
		};
		return {
			ok: true,
			body
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Write failed"
		};
	}
});
//#endregion
export { inspectThread_createServerFn_handler, runHunt_createServerFn_handler, writeOutreach_createServerFn_handler };
