import querystring from 'querystring'
import fs from 'fs'
import path from 'path'

export default async function getParams (ctx, next) {
  const { req, res } = ctx
  const { query } = new URL(`http://${req.headers.host}${req.url}`)
  ctx.params = querystring.parse(query)
  if (req.method === 'POST') {
    const headers = req.headers
    // 读取POST的body数据
    const body = await new Promise((resolve) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk.toString()
      })
      req.on('end', () => {
        resolve(data)
      })
    })
    ctx.params = ctx.params || {}
    if (headers['content-type'] === 'application/x-www-form-urlencoded') {
      Object.assign(ctx.params, querystring.parse(body))
    }
    else {
      Object.assign(ctx.params, JSON.parse(body))
    }
  }
  await next()
}
