import { NOT_FOUND_METADATA } from '@/lib/seo';
import { NotFoundPage } from '@/views/info';

export const metadata = NOT_FOUND_METADATA;

/** notFound() in a page of the site (an unknown product or work): the (site) layout already draws the chrome around it. */
export default function NotFound() {
  return <NotFoundPage />;
}
