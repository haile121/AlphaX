import { redirect } from 'next/navigation';

/** Old URL — admin route moved to /admin/track-resources */
export default function LegacyCompletionVideosRedirect() {
  redirect('/admin/track-resources');
}
