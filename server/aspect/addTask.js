import querystring from 'querystring'
import fs from 'fs'
import path from 'path'
import { addTask } from '../utils/todolist.js'
export default async function addTaskFn ({ res, dataBase, params }, next) {
  console.log('addTask')
  res.setHeader('Content-Type', 'application/json')
  const result = await addTask(dataBase, params)
  res.body = result
  await next()
}
