import http from 'http'
import url from 'url'
import path from 'path'
import fs from 'fs'
import mime from 'mime'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
export const server = http.createServer((req, res) => {
//   const filePath = path.resolve(__dirname, path.join('wwww', url.fileURLToPath(`file:///${req.url}`)))
  let filePath = path.resolve(path.dirname(__dirname), path.join('www', url.fileURLToPath(`file:/${req.url}`))) // 解析请求的路径
  console.log(filePath)
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    const isDir = stats.isDirectory()
    if (isDir) {
      filePath = path.join(filePath, 'index.html')
    }

    if (!isDir || fs.existsSync(filePath)) {
      // const file = fs.readFileSync(filePath)
      let status = 200
      const { ext } = path.parse(filePath)
      // 获取协商缓存
      const ifModifiedSince = req.headers['if-modified-since']
      // 如果timeStamp和stats.mtimeMS相等，说明文件内容没有修改
      if (ifModifiedSince && +ifModifiedSince === stats.mtimeMs) {
        status = 304
      }
      // 设置强缓存 and 协商缓存
      res.writeHead(status, { 'Content-Type': mime.getType(ext), 'Cache-Control': 'max-age=3600', 'Last-Modified': stats.mtimeMs })
      /// / 如果状态码不是200，不用返回Body
      if (status === 304) return res.end()
      // return res.end(file)
      // 文件流方式读取
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
      return
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/html' })
  res.end('<h1>Not Found</h1>')
})
server.on('clientError', (err, socket) => {
  console.log(err)
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen(8080, () => {
  console.log('opened server on', server.address())
})
