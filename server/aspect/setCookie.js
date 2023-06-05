export async function getCookie (ctx, next) {
  const { req } = ctx
  const cookieStr = decodeURIComponent(req.headers.cookie)
  const cookies = cookieStr.split(/\s*;\s*/)
  console.log(cookies)
  ctx.cookie = {}
  cookies.forEach(cookie => {
    const [key, value] = cookie.split('=')
    ctx.cookie[key] = value
  })
  await next()
}
