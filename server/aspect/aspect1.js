import url from 'url'
import path from 'path'
import fs from 'fs'
import zlib from 'zlib'
import mime from 'mime'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default async function aspect1 ({ res, req, route }, next) {
  let changePath = req.url
  console.log(req.url)
  const changePathArr = changePath.split('/')
  console.log(changePath)
  if (changePathArr.length === 3) {
    if (changePathArr[changePathArr.length - 1] !== 'index.css') {
      changePath = '/index.html'
    }
    else {
      changePath = '/index.css'
    }
  }
  else {
    changePath = changePath.replace('/home', '')
  }
  //   if (req.url === '/test/123') {
  //     changePath = '/'
  //   }
  let filePath = path.resolve(path.dirname(path.dirname(__dirname)), path.join('www', url.fileURLToPath(`file:/${changePath}`))) // 解析请求的路径
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>Not Found</h1>')
  }
  const stats = fs.statSync(filePath)
  const isDir = stats.isDirectory()
  if (isDir) {
    filePath = path.join(filePath, 'index.html')
  }
  if (!isDir || fs.existsSync(filePath)) {
    // const file = fs.readFileSync(filePath)
    let status = 200
    const acceptEncoding = req.headers['accept-encoding']
    const { ext } = path.parse(filePath)
    const mimeType = mime.getType(ext)
    // 获取协商缓存
    const ifModifiedSince = req.headers['if-modified-since']
    // 如果timeStamp和stats.mtimeMS相等，说明文件内容没有修改
    if (ifModifiedSince && +ifModifiedSince === stats.mtimeMs) {
      status = 304
    }
    // 设置强缓存 and 协商缓存
    const resHeaders = { 'Content-Type': mimeType, 'Cache-Control': 'max-age=3600', 'Last-Modified': stats.mtimeMs }
    /// / 如果状态码不是200，不用返回Body
    if (status === 304) {
      res.writeHead(status, resHeaders)
      return
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
      resStream.pipe(comp)
      res.body = comp
    }
    else {
      res.body = resStream
    }
  }
  await next()
}
