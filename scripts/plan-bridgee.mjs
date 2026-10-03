import { readFile, lstat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = new URL(process.env.TAGBOOK_API_URL || 'https://unconfigured.invalid');
const token = process.env.TAGBOOK_PLAN_TOKEN;
if (!token || token.length < 32 || origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Configure an HTTPS TAGBOOK_API_URL and server-side TAGBOOK_PLAN_TOKEN.');
const root = resolve(process.argv[2] || '.');
const contents = await readFile(resolve(root, 'package.json'), 'utf8');
if (contents.length > 32768) throw new Error('Manifest exceeds planning limit.');
const manifest = JSON.parse(contents);
const dependencies = manifest.dependencies ?? {};
const existingPaths = [];
for (const path of ['src/bridgee/installation.ts', 'src/bridgee', 'src']) {
  try {
    const stat = await lstat(resolve(root, path));
    if (path.endsWith('.ts') || stat.isSymbolicLink() || !stat.isDirectory()) existingPaths.push(path);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const response = await fetch(new URL('/v1/integration/plan', origin), {
  method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ entry: 'github', package: { dependencies }, existingPaths }),
});
if (!response.ok) throw new Error(`Planning failed (${response.status}).`);
const text = await response.text();
if (text.length > 32768) throw new Error('Plan exceeds response limit.');
const plan = JSON.parse(text);
if (plan.version !== '1' || plan.entry !== 'github' || typeof plan.supported !== 'boolean' || typeof plan.diff !== 'string') throw new Error('Invalid planner response.');
await writeFile('bridgee-plan.json', JSON.stringify(plan, null, 2) + '\n');
await writeFile('bridgee-installation.patch', plan.diff);
console.log(plan.supported ? 'Plan generated for review; no files applied.' : 'Manual review required; see bridgee-plan.json.');
