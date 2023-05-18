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
      const file = fs.readFileSync(filePath)

      const { ext } = path.parse(filePath)
      res.writeHead(200, { 'Content-Type': mime.getType(ext) })
      return res.end(file)
      // 文件流方式读取
      // const fileStream = fs.createReadStream(filePath)
      // fileStream.pipe(res)
      // return
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
