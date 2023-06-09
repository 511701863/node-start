import { login } from '../utils/user.js'

export default async function loginAsp (ctx, next) {
  const { dataBase, params, res } = ctx
  res.setHeader('Content-Type', 'application/json')
  const result = await login(dataBase, ctx, params)
  res.statusCode = 302
  if (!result) { // 登录失败，跳转到login继续登录
    res.setHeader('Location', '/home/login')
  }
  else {
    res.setHeader('Location', '/home/list') // 成功，跳转到 index
  }
  await next()
}
