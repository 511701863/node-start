import querystring from 'querystring'
import fs from 'fs'
import path from 'path'
import { addTask } from '../utils/todolist.js'
import { checkLogin } from './aspectDB.js'
export default async function addTaskFn (ctx, next) {
  const { res, dataBase, params } = ctx
  res.setHeader('Content-Type', 'application/json')
  const userInfo = await checkLogin(ctx)
  if (userInfo) {
    const result = await addTask(dataBase, params)
    res.body = result
  }
  else {
    res.body = { err: 'not login' }
  }
  await next()
}
