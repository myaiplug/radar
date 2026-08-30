export function sanitizeUrl(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (!url.hostname.includes(".")) return "";
    if (url.hostname === "twitter.com" || url.hostname === "www.twitter.com") {
      url.hostname = "x.com";
    }
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "s" || key === "t" || key === "ref" || key === "si") {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function urlKey(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/$/, "").toLowerCase();
    return `${host}${path}`;
  } catch {
    return url.replace(/\/$/, "").toLowerCase();
  }
}

export function statusId(url: string): string {
  const match = url.match(/\/(?:status|statuses)\/(\d+)/i);
  return match?.[1] ?? "";
}

export function isPostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname;
    if (host === "x.com" || host === "twitter.com") {
      return /\/status\/\d+/.test(path);
    }
    if (host.endsWith("reddit.com")) {
      return /\/comments\//.test(path);
    }
    if (host.endsWith("upwork.com")) {
      return /\/jobs?\//.test(path) || /job_/.test(path);
    }
    if (host.endsWith("fiverr.com")) {
      return /\/(gigs?|request|categories)\//.test(path);
    }
    if (host.endsWith("instagram.com")) {
      return /\/(p|reel|reels)\//.test(path);
    }
    if (host.endsWith("linkedin.com")) {
      return /\/(posts|feed|jobs)\//.test(path);
    }
    return false;
  } catch {
    return false;
  }
}

export function postLabel(url: string): string {
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

export function displayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = decodeURIComponent(parsed.pathname).replace(/\/$/, "");
    const shown = `${host}${path}`;
    if (shown.length <= 52) return shown;
    return `${shown.slice(0, 30)}…${shown.slice(-18)}`;
  } catch {
    return url;
  }
}

export function handleFromPostUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (host === "x.com" || host === "twitter.com") {
      if (parts[0] && parts[0] !== "i" && parts[1] === "status") return `@${parts[0]}`;
      return "";
    }
    if (host.endsWith("reddit.com")) {
      const i = parts.indexOf("r");
      if (i >= 0 && parts[i + 1]) return `r/${parts[i + 1]}`;
    }
    if (host.endsWith("upwork.com")) return "Upwork";
    if (host.endsWith("fiverr.com")) return "Fiverr";
  } catch {
    return "";
  }
  return "";
}

export function collectUrls(value: unknown, into: string[] = []): string[] {
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
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === "url" || key === "uri" || key === "href" || key === "link" || key === "postUrl") {
        const url = sanitizeUrl(String(nested ?? ""));
        if (url) into.push(url);
      }
      collectUrls(nested, into);
    }
  }
  return into;
}

export function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    const key = urlKey(url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

export function rankPostUrls(urls: string[]): string[] {
  const unique = uniqueUrls(urls);
  const posts = unique.filter(isPostUrl);
  const rest = unique.filter((url) => !isPostUrl(url));
  return [...posts, ...rest];
}

export function citationMatch(url: string, citations: string[]): string {
  if (!url) return "";
  const key = urlKey(url);
  const id = statusId(url);
  for (const citation of citations) {
    if (!isPostUrl(citation)) continue;
    if (urlKey(citation) === key) return citation;
    if (id && statusId(citation) === id) return citation;
  }
  return "";
}

export function groundPostUrl(
  raw: Record<string, unknown>,
  citations: string[],
  used: Set<string>,
): string {
  const open = citations.filter((url) => isPostUrl(url) && !used.has(urlKey(url)));
  const tryMatch = (url: string): string => {
    const hit = citationMatch(url, open);
    return hit && !used.has(urlKey(hit)) ? hit : "";
  };

  const explicit = sanitizeUrl(String(raw.postUrl ?? raw.url ?? raw.link ?? ""));
  const fromExplicit = tryMatch(explicit);
  if (fromExplicit) return fromExplicit;

  const blob = [raw.why, raw.postQuote, raw.quote, raw.angle, raw.contact, raw.nextAction]
    .map((part) => String(part ?? ""))
    .join(" ");
  for (const url of uniqueUrls(collectUrls(blob))) {
    const hit = tryMatch(url);
    if (hit) return hit;
  }

  const handle = String(raw.contact ?? raw.name ?? "")
    .replace(/^@/, "")
    .trim()
    .toLowerCase();
  if (handle && /^[a-z0-9_]{2,30}$/i.test(handle)) {
    const hit = open.find((url) => {
      try {
        const path = new URL(url).pathname.toLowerCase();
        return path.startsWith(`/${handle}/status/`);
      } catch {
        return false;
      }
    });
    if (hit) return hit;
  }

  return "";
}

export function matchPostUrl(
  raw: Record<string, unknown>,
  citations: string[],
  used: Set<string>,
): string {
  return groundPostUrl(raw, citations, used);
}
