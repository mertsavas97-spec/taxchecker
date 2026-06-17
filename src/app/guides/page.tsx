import { permanentRedirect } from 'next/navigation';

/** Legacy /guides URL — resources hub is the canonical guides index. */
export default function GuidesPage() {
  permanentRedirect('/resources');
}
