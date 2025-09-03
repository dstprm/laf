#!/usr/bin/env node
/*
  Lists top-level component groups under src/components.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsRoot = path.resolve(__dirname, '../src/components');
const outputPath = path.resolve(__dirname, '../docs/ai-context/component-library.md');

const groups = fs
  .readdirSync(componentsRoot, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((d) => d.name)
  .sort();

let md = 'Component Library\n\n';
for (const g of groups) {
  md += `- ${g}\n`;
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, md);
console.log('Generated:', outputPath);
