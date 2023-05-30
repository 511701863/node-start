import querystring from 'querystring'
import fs from 'fs'
// 编译模板
import handleBars from 'handlebars'
import { getCoronavirusKeyIndex, getCoronavirusByDate } from '../mock/index.js'
import path from 'path'
// 获取模板文件
const tpl = fs.readFileSync(path.join(path.resolve(), './www/server-index.html'), { encoding: 'utf-8' })
const tplData = fs.readFileSync(path.join(path.resolve(), './www/server-index-data.html'), { encoding: 'utf-8' })
export default async function getParams (ctx, next) {
  const { req, res } = ctx
  const { query } = new URL(`http://${req.headers.host}${req.url}`)
  ctx.params = querystring.parse(query)
  let data = []
  let contentType = 'application/json'
  if (ctx.route.url) {
    data = getCoronavirusByDate(ctx.route.url)
    // 编译模板
    const template = handleBars.compile(tplData)
    // 结合数据模板
    data = template({ data })
    contentType = 'text/html'
  }
  else {
    data = getCoronavirusKeyIndex()
    // 编译模板
    const template = handleBars.compile(tpl)
    // 结合数据模板
    data = template({ data })
    contentType = 'text/html'
  }
  res.setHeader('Content-Type', contentType)
  res.body = data
  await next()
}
