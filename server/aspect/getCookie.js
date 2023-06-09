export async function getCookie (ctx, next) {
  const { req } = ctx
  const cookieStr = req.headers.cookie ? decodeURIComponent(req.headers.cookie) : ''
  const cookies = cookieStr ? cookieStr.split(/\s*;\s*/) : []
  ctx.cookie = {}
  cookies.forEach(cookie => {
    const [key, value] = cookie.split('=')
    ctx.cookie[key] = value
  })
  await next()
}
