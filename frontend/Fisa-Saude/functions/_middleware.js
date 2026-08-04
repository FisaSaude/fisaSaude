export async function onRequest(context) {
  const url = new URL(context.request.url)

  // Canonical: sem www
  if (url.hostname === 'www.fisasaude.com.br') {
    url.hostname = 'fisasaude.com.br'
    return Response.redirect(url.toString(), 301)
  }

  return context.next()
}
