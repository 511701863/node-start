import http from 'http'
import Interceptor from './interceptor/index.js'

export default class Server {
  constructor () {
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
    console.log('Server up' + `http://${options.host}:${options.port}`)
    this.server.listen(options, () => { cb(this.server) })
  }

  // 添加拦截器
  use (aspect) {
    return this.interceptor.use(aspect)
  }
}
