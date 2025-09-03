#!/usr/bin/env node
/*
  Walks src/app/api and lists endpoints with methods.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiRoot = path.resolve(__dirname, '../src/app/api');
const outputPath = path.resolve(__dirname, '../docs/ai-context/api-endpoints.md');

function findRoutes(dir, prefix = '/api') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routes = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      routes.push(...findRoutes(full, `${prefix}/${e.name}`));
    } else if (e.isFile() && e.name === 'route.ts') {
      routes.push(prefix);
    }
  }
  return routes;
}

const routes = findRoutes(apiRoot).sort();
let md = 'API Endpoints\n\n';
for (const r of routes) {
  md += `- ${r}/route.ts\n`;
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, md);
console.log('Generated:', outputPath);
