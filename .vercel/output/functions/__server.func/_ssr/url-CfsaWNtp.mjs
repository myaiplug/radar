//#region node_modules/.nitro/vite/services/ssr/assets/url-CfsaWNtp.js
function sanitizeUrl(raw) {
	const value = String(raw ?? "").trim();
	if (!value) return "";
	const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	try {
		const url = new URL(withProtocol);
		if (url.protocol !== "http:" && url.protocol !== "https:") return "";
		if (!url.hostname.includes(".")) return "";
		if (url.hostname === "twitter.com" || url.hostname === "www.twitter.com") url.hostname = "x.com";
		for (const key of [...url.searchParams.keys()]) if (key.startsWith("utm_") || key === "s" || key === "t" || key === "ref" || key === "si") url.searchParams.delete(key);
		url.hash = "";
		return url.toString();
	} catch {
		return "";
	}
}
function urlKey(url) {
	try {
		const parsed = new URL(url);
		return `${parsed.hostname.replace(/^www\./, "").toLowerCase()}${parsed.pathname.replace(/\/$/, "").toLowerCase()}`;
	} catch {
		return url.replace(/\/$/, "").toLowerCase();
	}
}
function statusId(url) {
	return url.match(/\/(?:status|statuses)\/(\d+)/i)?.[1] ?? "";
}
function isPostUrl(url) {
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
		const path = parsed.pathname;
		if (host === "x.com" || host === "twitter.com") return /\/status\/\d+/.test(path);
		if (host.endsWith("reddit.com")) return /\/comments\//.test(path);
		if (host.endsWith("upwork.com")) return /\/jobs?\//.test(path) || /job_/.test(path);
		if (host.endsWith("fiverr.com")) return /\/(gigs?|request|categories)\//.test(path);
		if (host.endsWith("instagram.com")) return /\/(p|reel|reels)\//.test(path);
		if (host.endsWith("linkedin.com")) return /\/(posts|feed|jobs)\//.test(path);
		return path.length > 1 && path !== "/";
	} catch {
		return false;
	}
}
function postLabel(url) {
	try {
		const host = new URL(url).hostname.replace(/^www\./, "");
		if (host === "x.com" || host === "twitter.com") return "Open post on X";
		if (host.includes("reddit.com")) return "Open Reddit thread";
		if (host.includes("upwork.com")) return "Open Upwork job";
		if (host.includes("fiverr.com")) return "Open Fiverr gig";
		if (host.includes("instagram.com")) return "Open Instagram";
		if (host.includes("linkedin.com")) return "Open LinkedIn";
		return `Open ${host}`;
	} catch {
		return "Open post";
	}
}
function displayUrl(url) {
	try {
		const parsed = new URL(url);
		const shown = `${parsed.hostname.replace(/^www\./, "")}${decodeURIComponent(parsed.pathname).replace(/\/$/, "")}`;
		if (shown.length <= 52) return shown;
		return `${shown.slice(0, 30)}…${shown.slice(-18)}`;
	} catch {
		return url;
	}
}
function collectUrls(value, into = []) {
	if (typeof value === "string") {
		const url = sanitizeUrl(value);
		if (url) into.push(url);
		const matches = value.match(/https?:\/\/[^\s"'<>)\]]+/g) ?? [];
		for (const match of matches) {
			const clean = sanitizeUrl(match.replace(/[.,;]+$/, ""));
			if (clean) into.push(clean);
		}
		return into;
	}
	if (Array.isArray(value)) {
		for (const item of value) collectUrls(item, into);
		return into;
	}
	if (value && typeof value === "object") for (const [key, nested] of Object.entries(value)) {
		if (key === "url" || key === "uri" || key === "href" || key === "link" || key === "postUrl") {
			const url = sanitizeUrl(String(nested ?? ""));
			if (url) into.push(url);
		}
		collectUrls(nested, into);
	}
	return into;
}
function uniqueUrls(urls) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const url of urls) {
		const key = urlKey(url);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		out.push(url);
	}
	return out;
}
function rankPostUrls(urls) {
	const unique = uniqueUrls(urls);
	const posts = unique.filter(isPostUrl);
	const rest = unique.filter((url) => !isPostUrl(url));
	return [...posts, ...rest];
}
function matchPostUrl(raw, citations, used) {
	const explicit = sanitizeUrl(String(raw.postUrl ?? raw.url ?? raw.link ?? ""));
	if (isPostUrl(explicit) && !used.has(urlKey(explicit))) return explicit;
	const fromText = uniqueUrls(collectUrls([
		raw.why,
		raw.postQuote,
		raw.quote,
		raw.angle,
		raw.contact,
		raw.nextAction
	].map((part) => String(part ?? "")).join(" "))).find((url) => isPostUrl(url) && !used.has(urlKey(url)));
	if (fromText) return fromText;
	const id = statusId(explicit);
	if (id) {
		const hit = citations.find((url) => statusId(url) === id && !used.has(urlKey(url)));
		if (hit) return hit;
	}
	return "";
}
//#endregion
export { postLabel as a, uniqueUrls as c, matchPostUrl as i, urlKey as l, displayUrl as n, rankPostUrls as o, isPostUrl as r, sanitizeUrl as s, collectUrls as t };
