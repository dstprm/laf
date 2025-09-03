import fs from 'fs';
import path from 'path';

const DOCS_ROOT = path.join(process.cwd(), 'docs');

export type DocFile = {
  title: string;
  route: string; // e.g., /docs/guides/getting-started
  filePath: string; // absolute
  slug: string;
};

export type DocSection = {
  name: string; // e.g., guides, ai-context
  route: string; // /docs/guides
  items: DocFile[];
};

function toTitle(filename: string): string {
  const noExt = filename.replace(/\.mdx?$/, '').replace(/-/g, ' ');
  return noExt.charAt(0).toUpperCase() + noExt.slice(1);
}

export function getDocsTree(): DocSection[] {
  const sections: DocSection[] = [];
  if (!fs.existsSync(DOCS_ROOT)) return sections;

  const entries = fs.readdirSync(DOCS_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sectionDir = path.join(DOCS_ROOT, entry.name);
      const files = fs
        .readdirSync(sectionDir, { withFileTypes: true })
        .filter((f) => f.isFile() && /\.mdx?$/.test(f.name));

      let items: DocFile[] = files.map((f) => {
        const filePath = path.join(sectionDir, f.name);
        const title = toTitle(f.name);
        const slug = f.name.replace(/\.mdx?$/, '');
        const route = `/docs/${entry.name}/${slug}`;
        return { title, route, filePath, slug };
      });

      // Custom ordering for guides: ensure getting-started appears first, others alphabetical
      if (entry.name === 'guides') {
        items = items.sort((a, b) => {
          if (a.slug === 'getting-started') return -1;
          if (b.slug === 'getting-started') return 1;
          return a.title.localeCompare(b.title);
        });
      } else {
        // Default alphabetical by title
        items = items.sort((a, b) => a.title.localeCompare(b.title));
      }

      sections.push({ name: entry.name, route: `/docs/${entry.name}`, items });
    }
  }

  // Keep sections in filesystem order (typically alphabetical), with their items sorted above
  return sections.filter((section) => section.name === 'guides');
}

export function getDocContentFromSlug(slug: string[]): { content: string; title: string } | null {
  // slug like ['guides','getting-started'] maps to docs/guides/getting-started.md
  if (!slug.length) return null;
  const maybeMd = path.join(DOCS_ROOT, ...slug) + '.md';
  const maybeMdx = path.join(DOCS_ROOT, ...slug) + '.mdx';
  let filePath = '';
  if (fs.existsSync(maybeMd)) filePath = maybeMd;
  else if (fs.existsSync(maybeMdx)) filePath = maybeMdx;
  else return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const title = toTitle(path.basename(filePath));
  return { content, title };
}
