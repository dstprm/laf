import { ActiveLink } from './active-link';
import { getDocsTree } from '@/lib/docs';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections = getDocsTree();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3 border-r pr-4">
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.name}>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{section.name}</div>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.route}>
                    <ActiveLink href={item.route}>{item.title}</ActiveLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="col-span-12 md:col-span-9 prose prose-zinc dark:prose-invert max-w-none">{children}</main>
    </div>
  );
}
