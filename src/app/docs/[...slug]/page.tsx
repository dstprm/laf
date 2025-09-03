import { notFound } from 'next/navigation';
import { getDocContentFromSlug } from '@/lib/docs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Params = { slug: string[] };

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const data = getDocContentFromSlug(slug);
  if (!data) return notFound();

  // Use first markdown heading as title if present
  const match = data.content.match(/^#\s+(.+)$/m);
  const title = match?.[1] ?? data.title;

  return (
    <article>
      <h1>{title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
    </article>
  );
}
