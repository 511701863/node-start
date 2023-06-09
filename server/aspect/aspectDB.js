import path from 'path'
import { getSession } from '../utils/session.js'
import { getList } from '../utils/todolist.js'

const __dirname = path.resolve()

export default async function aspectDB (ctx, next) {
  const { res, req, dataBase } = ctx
  const userInfo = await checkLogin(ctx)
  res.setHeader('Content-Type', 'application/json')
  if (userInfo) {
    const result = await getList(dataBase)
    res.body = { data: result }
  }
  else {
    res.body = { err: 'not login' }
  }

  await next()
}

export async function checkLogin (ctx) {
  const userInfo = await getSession(ctx.dataBase, ctx, 'userInfo')
  ctx.userInfo = userInfo
  return ctx.userInfo
}
