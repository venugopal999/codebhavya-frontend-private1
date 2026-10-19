// Serve the same public lesson content before client-side enhancement.
// Exact routes only; payment, account and other requests continue through worker.js.
export async function publicLessonResponse(request, env) {
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const url = new URL(request.url);
  const course = {
    '/Full-Stack/lesson.html': ['full-stack', 30],
    '/Full-Stack/lesson': ['full-stack', 30],
    '/Java/lesson.html': ['java', 24],
    '/Java/lesson': ['java', 24]
  }[url.pathname];
  if (!course) return null;
  const level = Number(url.searchParams.get('level')) || 1;
  if (!Number.isInteger(level) || level < 1 || level > course[1]) return null;
  const assetURL = new URL(`/course-snapshots/${course[0]}-${String(level).padStart(2, '0')}.txt`, url);
  try {
    const asset = await env.ASSETS.fetch(new Request(assetURL, { method: 'GET' }));
    if (asset.status !== 200) return null;
    const headers = new Headers(asset.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('X-Content-Type-Options', 'nosniff');
    // Direct snapshot files are noindex. Public lesson URLs remain indexable.
    headers.delete('X-Robots-Tag');
    headers.delete('Content-Disposition');
    return new Response(request.method === 'HEAD' ? null : asset.body, { status: 200, headers });
  } catch {
    // A missing/unavailable snapshot must not break the original lesson engine.
    return null;
  }
}
