#!/usr/bin/env node
/*
  Generates docs/ai-context/database-schema.md from prisma/schema.prisma.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prismaSchemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const outputPath = path.resolve(__dirname, '../docs/ai-context/database-schema.md');

const schema = fs.readFileSync(prismaSchemaPath, 'utf8');

const lines = schema.split(/\r?\n/);
const models = [];
let current = null;

for (const line of lines) {
  const modelStart = line.match(/^model\s+(\w+)\s+\{/);
  if (modelStart) {
    current = { name: modelStart[1], fields: [] };
    models.push(current);
    continue;
  }
  if (current && line.trim() === '}') {
    current = null;
    continue;
  }
  if (current) {
    const field = line.trim();
    if (!field || field.startsWith('//') || field.startsWith('///')) continue;
    // basic field capture: name type ...
    const m = field.match(/^(\w+)\s+([^\s]+)/);
    if (m) {
      current.fields.push({ name: m[1], type: m[2] });
    }
  }
}

let md = 'Database Schema\n\n';
for (const m of models) {
  md += `### ${m.name}\n`;
  for (const f of m.fields) {
    md += `- ${f.name}: ${f.type}\n`;
  }
  md += '\n';
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, md);
console.log('Generated:', outputPath);
