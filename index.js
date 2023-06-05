import aspect1 from './server/aspect/aspect1.js'
import aspect2 from './server/aspect/getData.js'
import aspectFavicon from './server/aspect/aspectFavicon.js'
import aspectDB from './server/aspect/aspectDB.js'
import addTask from './server/aspect/addTask.js'
import updateTask from './server/aspect/updateTask.js'
import userPage from './server/aspect/userPage.js'
import getParams from './server/aspect/params.js'
import { getCookie } from './server/aspect/setCookie.js'

import Server from './server/http-server.js'
import { Router } from './server/middleware/router.js'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
// 获取数据库
const dbFile = path.resolve(path.resolve(), './server/user_table.db')
let db = null
const router = new Router()
const server = new Server()

const useAspect = router.get('/home/:data/:file/:name', aspect1)
const useAspect2 = router.get('/home/:index', aspect1)
const useAspect4 = router.get('/favicon.ico', aspectFavicon)
// const useAspect2 = router.get('/home/:data', aspect2)
const useAspect5 = router.get('/list/todo/getlist', aspectDB)
const useAspect3 = router.get('/home/:data/:url', aspect2)
const useAspect6 = router.post('/addtask', addTask)
const useAspect7 = router.post('/updatetask', updateTask)
// 获取cookie
server.use(getCookie)
// 截取params
server.use(getParams)
server.use(useAspect)
server.use(useAspect4)
server.use(useAspect2)
server.use(useAspect3)
// 数据库相关
server.use(async (ctx, next) => {
  // 如果数据库连接未创建，就创建一个
  if (!db) {
    db = await open({
      filename: dbFile,
      driver: sqlite3.cached.Database
    })
  }
  // 将db挂在ctx上下文对象的dataBase属性上
  ctx.dataBase = db
  await next()
})
server.use(useAspect5)
// 添加任务
server.use(useAspect6)
server.use(useAspect7)
// server.use(router.get('.*', async ({ req, res }, next) => {
//   res.setHeader('Content-Type', 'text/html')
//   res.body = '<h1>Hello world</h1>'
//   await next()
// }))
// 设置cookie
const useAspectUser = router.get('/', userPage)
server.use(useAspectUser)

// 设置404页面
server.use(router.all('.*', async ({ params, req, res }, next) => {
  res.setHeader('Content-Type', 'text/html')
  res.body = '<h1>Not Found</h1>'
  res.statusCode = 404
  await next()
}))

server.listen({ port: '8080' }, (server) => {
  console.log(server.address())
})
