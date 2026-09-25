/**
 * GitHub Pages needs index.html at the site root, a 404 copy for deep links,
 * and .nojekyll so folders like __grok are published.
 */
import { access, copyFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", ".output", "public");

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const index = path.join(root, "index.html");
const shell = path.join(root, "_shell.html");
const dotHtml = path.join(root, ".html");
if (!(await exists(index)) && (await exists(shell))) {
  await copyFile(shell, index);
}
if (!(await exists(index)) && (await exists(dotHtml))) {
  await copyFile(dotHtml, index);
}
// A file named ".html" makes GitHub Pages serve the site root as
// application/octet-stream, so browsers download it instead of rendering it.
if (await exists(dotHtml)) await unlink(dotHtml);
if (!(await exists(index))) {
  throw new Error(`GitHub Pages output missing ${index}`);
}
await copyFile(index, path.join(root, "404.html"));
await writeFile(path.join(root, ".nojekyll"), "");
console.log(`pages output ready at ${root}`);
