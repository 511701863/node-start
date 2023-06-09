
export default async function setCookie (ctx, next) {
  const { cookie, route, res } = ctx
  res.setHeader('Content-Type', 'text/html;charset=utf-8')
  // 设置cookie
  let id = cookie?.userId ?? false
  if (!id) {
    id = Math.random().toString(36).slice(2)
  }
  res.setHeader('Set-Cookie', `userId=${id};Path=/; Max-Age=86400`)
  ctx.cookie.userId = id
  await next()
}
