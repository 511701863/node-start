import http from 'http'
import url from 'url'
import path from 'path'
import fs from 'fs'
import mime from 'mime'
import checksum from 'checksum'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
export const server = http.createServer((req, res) => {
  //   const filePath = path.resolve(__dirname, path.join('wwww', url.fileURLToPath(`file:///${req.url}`)))
  let filePath = path.resolve(path.dirname(__dirname), path.join('www', url.fileURLToPath(`file:/${req.url}`))) // 解析请求的路径
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>Not Found</h1>')
    return
  }
  const stats = fs.statSync(filePath)
  const isDir = stats.isDirectory()
  if (isDir) {
    filePath = path.join(filePath, 'index.html')
  }
  if (!isDir || fs.existsSync(filePath)) {
    // 把反斜杠转换为正斜杠
    checksum.file(filePath, (err, sum) => {
      console.log(err, 'sum err')
      sum = `"${sum}"`
      const { ext } = path.parse(filePath)
      // 获取协商缓存
      const ifNoneMatch = req.headers['if-none-match']
      if (ifNoneMatch === sum) {
        res.writeHead(304, { 'Content-Type': mime.getType(ext), 'Cache-Control': 'max-age=3600', ETag: sum })
        return res.end()
      }
      res.writeHead(200, { 'Content-Type': mime.getType(ext), 'Cache-Control': 'max-age=3600', ETag: sum })
      const resStream = fs.ReadStream(filePath)
      resStream.pipe(res)
    })
  }
})
server.on('clientError', (err, socket) => {
  console.log(err, 'err')
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen(8080, () => {
  console.log('opened server on', server.address())
})
