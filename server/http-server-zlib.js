import http from 'http'
import url from 'url'
import path from 'path'
import fs from 'fs'
import mime from 'mime'
import checksum from 'checksum'
import zlib from 'zlib'

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
    const { ext } = path.parse(filePath)
    const mimeType = mime.getType(ext)
    const acceptEncoding = req.headers['accept-encoding']
    // 计算文件的hash值
    // eslint-disable-next-line n/handle-callback-err
    checksum.file(filePath, (err, sum) => {
      sum = `"${sum}"`
      const resHeaders = { 'Content-Type': mimeType, 'Cache-Control': 'max-age=3600', ETag: sum }
      // 获取协商缓存
      const ifNoneMatch = req.headers['if-none-match']
      if (ifNoneMatch === sum) {
        res.writeHead(304, resHeaders)
        return res.end()
      }
      // 判断文件类型
      const compress = /^(text|application)\//.test(mimeType)
      if (compress) {
        // 返回客户端支持的一种压缩方式
        acceptEncoding.split(/\s*,\s*/).some((encoding) => {
          if (encoding === 'gzip') {
            resHeaders['Content-Encoding'] = 'gzip'
            return true
          }
          if (encoding === 'deflate') {
            resHeaders['Content-Encoding'] = 'deflate'
            return true
          }
          if (encoding === 'br') {
            resHeaders['Content-Encoding'] = 'br'
            return true
          }
          return false
        })
      }
      const compressionEncoding = resHeaders['Content-Encoding'] // 获取选中的压缩方式
      res.writeHead(200, resHeaders)
      const resStream = fs.ReadStream(filePath)
      console.log(compress, compressionEncoding)
      if (compress && compressionEncoding) {
        let comp
        // 使用指定的压缩方式压缩文件
        if (compressionEncoding === 'gzip') {
          comp = zlib.createGzip()
        }
        else if (compressionEncoding === 'deflate') {
          comp = zlib.createDeflate()
        }
        else {
          comp = zlib.createBrotliCompress()
        }
        resStream.pipe(comp).pipe(res)
      }
      else {
        resStream.pipe(res)
      }
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
