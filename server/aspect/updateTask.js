import querystring from 'querystring'
import fs from 'fs'
import path from 'path'
import { updateTask } from '../utils/todolist.js'
export default async function updateTaskFn ({ res, dataBase, params, cookie }, next) {
  console.log('addTask', cookie)
  res.setHeader('Content-Type', 'application/json')
  const result = await updateTask(dataBase, params)
  res.body = result
  await next()
}
