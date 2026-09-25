/**
 * Pull public hiring posts into public/feed.json.
 * Runs in CI and locally before the GitHub Pages build. No API keys.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "feed.json");
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const UA = "radar-pages/1.0 (https://github.com/myaiplug/radar)";

const SUBS = [
  "forhire",
  "slavelabour",
  "hiring",
  "audioengineering",
  "WeAreTheMusicMakers",
  "makinghiphop",
  "edmproduction",
  "GameDevClassifieds",
  "freelance_forhire",
  "designjobs",
];

const ASK =
  /\[hiring\]|\[task\]|\[paid\]|looking for|need a |need an |who can |budget|paid gig|seeking a|hire a|hiring a|\[help\]|iso a |want to pay/i;
const SELL = /\[(for hire|offer)\]/i;

const posts = [];
const seen = new Set();

function add(post) {
  if (!post?.url || !post.title || seen.has(post.url)) return;
  if (/^\[(removed|deleted)\]$/i.test(String(post.text || "").trim())) return;
  const created = Date.parse(post.createdAt);
  if (!Number.isFinite(created) || Date.now() - created > MAX_AGE_MS) return;
  seen.add(post.url);
  posts.push({
    source: post.source,
    name: String(post.name || "Unknown").slice(0, 80),
    company: String(post.company || "").slice(0, 80),
    contact: String(post.contact || "").slice(0, 200),
    title: String(post.title).replace(/\s+/g, " ").trim().slice(0, 180),
    text: String(post.text || "").replace(/\s+/g, " ").trim().slice(0, 600),
    url: post.url,
    createdAt: new Date(created).toISOString(),
  });
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function isAsk(title, text) {
  if (SELL.test(title)) return false;
  return ASK.test(`${title}\n${text}`);
}

async function reddit() {
  // Reddit's own JSON blocks many clients. Arctic Shift mirrors public posts.
  const after = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;
  for (const sub of SUBS) {
    try {
      const data = await getJson(
        `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=${encodeURIComponent(sub)}&limit=40&sort=desc&after=${after}`,
      );
      const rows = Array.isArray(data?.data) ? data.data : [];
      for (const row of rows) {
        if (!row || row.stickied) continue;
        const title = String(row.title ?? "");
        const text = String(row.selftext ?? "");
        if (!isAsk(title, text)) continue;
        const permalink = String(row.permalink ?? "");
        if (!permalink) continue;
        add({
          source: "reddit",
          name: row.author ? `u/${row.author}` : "Reddit",
          company: `r/${sub}`,
          contact: row.author ? `https://www.reddit.com/user/${row.author}` : "",
          title,
          text,
          url: permalink.startsWith("http") ? permalink : `https://www.reddit.com${permalink}`,
          createdAt: new Date(Number(row.created_utc) * 1000).toISOString(),
        });
      }
    } catch (err) {
      console.warn(`reddit r/${sub}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

async function hn() {
  const queries = [
    "looking for freelance",
    "hiring designer",
    "need a developer",
    "looking for a producer",
    "hiring writer",
  ];
  for (const query of queries) {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`;
    try {
      const data = await getJson(url);
      for (const hit of data?.hits ?? []) {
        const title = String(hit.title ?? hit.story_title ?? "");
        const text = String(hit.story_text ?? hit.comment_text ?? "");
        if (!isAsk(title, text) && !/hiring|freelance|looking for|need a/i.test(title)) continue;
        const objectId = hit.objectID;
        if (!objectId) continue;
        add({
          source: "hn",
          name: hit.author ? String(hit.author) : "HN",
          company: "Hacker News",
          contact: hit.author ? `https://news.ycombinator.com/user?id=${encodeURIComponent(hit.author)}` : "",
          title,
          text,
          url: `https://news.ycombinator.com/item?id=${objectId}`,
          createdAt: hit.created_at || new Date(Number(hit.created_at_i) * 1000).toISOString(),
        });
      }
    } catch (err) {
      console.warn(`hn ${query}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

async function jobs() {
  const searches = ["audio", "video", "designer", "writer", "developer"];
  for (const search of searches) {
    try {
      const data = await getJson(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}&limit=15`);
      for (const job of data?.jobs ?? []) {
        const title = String(job.title ?? "");
        const text = String(job.description ?? "").replace(/<[^>]+>/g, " ");
        add({
          source: "job",
          name: String(job.company_name ?? "Company"),
          company: String(job.company_name ?? "Remote"),
          contact: String(job.url ?? ""),
          title,
          text,
          url: String(job.url ?? ""),
          createdAt: job.publication_date || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`jobs ${search}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

await reddit();
await hn();
await jobs();

posts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
const file = {
  generatedAt: new Date().toISOString(),
  posts: posts.slice(0, 400),
};
await writeFile(OUT, JSON.stringify(file));
console.log(`wrote ${file.posts.length} posts to ${OUT}`);
if (file.posts.length === 0) {
  console.warn("feed is empty — hunt will tell the visitor nothing matched");
}
