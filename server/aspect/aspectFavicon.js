import url from 'url'
import path from 'path'
import fs from 'fs'
import zlib from 'zlib'
import mime from 'mime'

const __dirname = path.resolve()

export default async function aspectFavicon ({ res, req, route }, next) {
  const filePath = path.join(__dirname, './favicon.ico') // 解析请求的路径
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>Not Found</h1>')
  }
  if (fs.existsSync(filePath)) {
    const { ext } = path.parse(filePath)
    const mimeType = mime.getType(ext)
    const stats = fs.statSync(filePath)
    const resHeaders = { 'Content-Type': mimeType, 'Cache-Control': 'max-age=3600', 'Last-Modified': stats.mtimeMs }
    res.writeHead(200, resHeaders)
    const resStream = fs.ReadStream(filePath)
    res.body = resStream
  }
  await next()
}
