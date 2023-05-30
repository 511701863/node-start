import aspect1 from './server/aspect/aspect1.js'
import aspect2 from './server/aspect/params.js'
import aspectFavicon from './server/aspect/aspectFavicon.js'
import aspectDB from './server/aspect/aspectDB.js'
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

server.listen({ port: '8080' }, (server) => {
  console.log(server.address())
})
const useAspect = router.get('/home/:data/:file/:name', aspect1)
// const useAspect2 = router.get('/home/:index', aspect1)
const useAspect4 = router.get('/home/favicon.ico', aspectFavicon)
const useAspect2 = router.get('/home/:data', aspect2)
const useAspect5 = router.get('/list/todo/getlist', aspectDB)
const useAspect3 = router.get('/home/:data/:url', aspect2)
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
// server.use(router.get('.*', async ({ req, res }, next) => {
//   res.setHeader('Content-Type', 'text/html')
//   res.body = '<h1>Hello world</h1>'
//   await next()
// }))
