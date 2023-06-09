import { updateTask } from '../utils/todolist.js'
import { checkLogin } from './aspectDB.js'
export default async function updateTaskFn (ctx, next) {
  const { res, dataBase, params, cookie } = ctx
  const userInfo = await checkLogin(ctx)
  res.setHeader('Content-Type', 'application/json')
  if (userInfo) {
    const result = await updateTask(dataBase, params)
    res.body = result
  }
  else {
    res.body = { err: 'not login' }
  }
  await next()
}
