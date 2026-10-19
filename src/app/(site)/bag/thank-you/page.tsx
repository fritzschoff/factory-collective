import { Suspense } from 'react';
import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { ThankYouPage } from '@/views/info';

export const metadata = pageMetadata(staticPage('/bag/thank-you/'));

export default function Page({ searchParams }: PageProps<'/bag/thank-you'>) {
  return (
    <Suspense>
      <ThankYouFromQuery searchParams={searchParams} />
    </Suspense>
  );
}

async function ThankYouFromQuery({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
  const query = await searchParams;
  const sessionId = Array.isArray(query.session_id) ? query.session_id[0] : query.session_id;
  return <ThankYouPage sessionId={sessionId ?? null} />;
}
