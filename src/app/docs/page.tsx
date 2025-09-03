import Link from 'next/link';
import { getDocsTree } from '@/lib/docs';

export default function DocsIndexPage() {
  const sections = getDocsTree();

  return (
    <div>
      <h1>Documentation</h1>
      <p className="text-muted-foreground">Select a guide from the sidebar, or start here:</p>
      <ul className="list-disc pl-5">
        {sections.map((section) => (
          <li key={section.name}>
            <span className="font-medium">{section.name}</span>
            <ul className="list-disc pl-5">
              {section.items.map((item) => (
                <li key={item.route}>
                  <Link className="hover:underline" href={item.route}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
