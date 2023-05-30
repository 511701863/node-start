import url from 'url'
import path from 'path'
import fs from 'fs'
import { getList } from '../utils/todolist.js'

const __dirname = path.resolve()

export default async function aspectDB ({ res, req, dataBase }, next) {
  res.setHeader('Content-Type', 'application/json')
  const result = await getList(dataBase)
  console.log(result, 'dataBase')
  res.body = { data: result }
  await next()
}

async function checkLogin (ctx) {
  const { getSession } = require('./model/session')
  const userInfo = await getSession(ctx.database, ctx, 'userInfo')
  ctx.userInfo = userInfo
  return ctx.userInfo
}
