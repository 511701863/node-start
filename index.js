import aspect1 from './server/aspect/aspect1.js'
import aspect2 from './server/aspect/getData.js'
import aspectFavicon from './server/aspect/aspectFavicon.js'
import aspectDB from './server/aspect/aspectDB.js'
import addTask from './server/aspect/addTask.js'
import updateTask from './server/aspect/updateTask.js'
import setCookie from './server/aspect/setCookie.js'
import getParams from './server/aspect/params.js'
import { getCookie } from './server/aspect/getCookie.js'

import Server from './server/http-server.js'
import { Router } from './server/middleware/router.js'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import loginAsp from './server/aspect/login.js'
// 获取数据库
const dbFile = path.resolve(path.resolve(), './server/user_table.db')
let db = null
const router = new Router()
const server = new Server({ mode: 'dev' })
let count = 0
process.on('message', (msg) => { // 处理由worker.send发来的消息
  if (msg === 'count') { // 如果是count事件，则将count加一
    console.log('visit count: %d end', ++count)
  }
})
// 统计访问次数 给进程发消息 只适用于多进程
server.use(async (ctx, next) => {
  process.send('count')
  await next()
})
// 截取params
server.use(getParams)
// 获取cookie
server.use(getCookie)
// 设置cookie
server.use(setCookie)
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

// 页面及css js等
const useAspect = router.get('/home/:data/:file/:name', aspect1)
const useAspect2 = router.get('/home/list', aspect1)
const useAspectLoginPage = router.get('/home/login', aspect1)
const useAspect4 = router.get('/favicon.ico', aspectFavicon)
server.use(useAspect)
server.use(useAspect4)
server.use(useAspect2)
server.use(useAspectLoginPage)

// 服务端渲染
const useAspect3 = router.get('/home/:data/:url', aspect2)
server.use(useAspect3)

// 获取列表
const useAspect5 = router.get('/list/todo/getlist', aspectDB)
server.use(useAspect5)
// 添加更新任务
const useAspect6 = router.post('/addtask', addTask)
const useAspect7 = router.post('/updatetask', updateTask)
server.use(useAspect6)
server.use(useAspect7)

// 登录
const useAspectLogin = router.post('/login', loginAsp)
server.use(useAspectLogin)
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
