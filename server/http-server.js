import http from 'http'
import Interceptor from './interceptor/index.js'
import cluster from 'cluster'
import { cpus } from 'os'
import fs from 'fs'
import url from 'url'
import path from 'path'

// 获得CPU的内核数
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const cpuNum = cpus().length
export default class Server {
  constructor ({ instances = 1, enableCluster = true, mode = 'prod' } = {}) {
    if (mode === 'dev') {
      instances = 1 // 在开发模式下，为了提高开发速度，只启动一个worker进程
      enableCluster = true
    }
    this.mode = mode
    // 指定启动几个进程，默认启动和cpu的内核数一样多的进程
    this.instances = instances || cpuNum
    // 是否启动多进程服务
    this.enableCluster = enableCluster
    const interceptor = new Interceptor()
    this.server = http.createServer(async (req, res) => {
      await interceptor.run({ req, res }) // 执行注册了的拦截器切面
      // 请求完成 数据刷新后
      if (!res.writableFinished) {
        let body = res.body || '200 OK'
        if (body.pipe) {
          body.pipe(res)
        }
        else {
          if (typeof body !== 'string' && res.getHeader('Content-Type') === 'application/json') {
            body = JSON.stringify(body)
          }
          res.end(body)
        }
      }
    })

    this.server.on('clientError', (err, socket) => {
      console.log(err, 'err')
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
    })

    this.interceptor = interceptor
  }

  // 启动服务
  listen (options, cb = () => null) {
    if (typeof options === 'number') {
      options = { port: options }
    }
    options.host = options.host || '0.0.0.0'
    const instances = this.instances
    // 如果是主进程，创建instance个子进程
    if (cluster.isPrimary && this.enableCluster) {
      for (let i = 0; i < instances; i++) {
        cluster.fork() // 创建子进程
      }

      // 广播消息 把一个子进程收到的消息 转发给所有子进程
      function broadcast (message) { // eslint-disable-line no-inner-declarations
        Object.entries(cluster.workers).forEach(([id, worker]) => {
          worker.send(message)
        })
      }
      // 广播消息 遍历所有子进程 当其中任意子进程收到消息 主进程都能监听到 并广播
      Object.keys(cluster.workers).forEach((id) => {
        cluster.workers[id].on('message', broadcast)
      })

      // 如果是开发模式，监听js文件是否修改：
      // 如果文件有变化，则杀死所有子进程（即worker进程），并重新启动一个新的子进程。
      // 注意 主进程的代码并不能热更新，需要手动重启
      if (this.mode === 'dev') {
        fs.watch('.', { recursive: true }, (eventType, filename) => {
          if (eventType === 'change' && filename.indexOf('user_table') === -1 && filename.indexOf('git') === -1) { // 监听js文件是否更新
            console.log(filename, 'filename 1234')
            Object.entries(cluster.workers).forEach(([id, worker]) => {
              worker.kill() // 更新杀死进程
            })
            cluster.fork() // 重启进程获取新文件
          }
        })
      }
      else { // 如果在production模式下，则不能热更新：
        // 主进程监听exit事件，如果发现有某个子进程停止了，那么重新创建一个子进程
        cluster.on('exit', (worker, code, signal) => {
          console.log('worker %d died (%s). restarting...', worker.process.pid, signal || code)
          cluster.fork()
        })
      }
    }
    else { // 如果当前进程是子进程
      this.worker = cluster.worker
      console.log(`Starting up http-server http://${options.host}:${options.port}`)
      this.server.listen(options, () => cb(this.server))
    }
  }

  // 添加拦截器
  use (aspect) {
    return this.interceptor.use(aspect)
  }
}
