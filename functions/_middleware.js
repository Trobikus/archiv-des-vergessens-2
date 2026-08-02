/**
 * Canonical host: apex (grimoire-interactive.de).
 * 301 www → apex so search engines do not index duplicate hosts.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "www.grimoire-interactive.de") {
    url.hostname = "grimoire-interactive.de";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
