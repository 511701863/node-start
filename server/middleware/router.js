import url, { URL } from 'url'
import path from 'path'

/*
@rule：路径规则
@pathname：路径名
*/
export function check (rule, pathname) {
  rule = rule.replace(/\\/g, '/')
  // 解析规则
  const paraMatched = rule.match(/:[^/]+/g)
  const ruleExp = new RegExp(`^${rule.replace(/\/:[^/]+/g, '\\/([^/]+)')}$`)
  // 解析真正的路径
  const ruleMatched = pathname.match(ruleExp)
  // 将规则和路径拼接为对象：
  if (ruleMatched) {
    const ret = {}
    if (paraMatched) {
      for (let i = 0; i < paraMatched.length; i++) {
        ret[paraMatched[i].slice(1)] = ruleMatched[i + 1]
      }
    }
    return ret
  }
  return null
}

/*
@method: GET/POST/PUT/DELETE
@rule: 路径规则，比如：test/:course/:lecture
@aspect: 拦截函数
*/
export function route (method, rule, aspect) {
  return async (ctx, next) => {
    const req = ctx.req
    if (!ctx.url) ctx.url = new URL(`http://${req.headers.host}${req.url}`)
    const checked = check(rule, ctx.url.pathname) // 根据路径规则解析路径
    if (!ctx.route && (method === '*' || req.method === method) &&
            !!checked) {
      ctx.route = checked
      await aspect(ctx, next)
    }
    else { // 如果路径与路由规则不匹配，则跳过当前拦截切面，执行下一个拦截切面
      await next()
    }
  }
}

export class Router {
  constructor (base = '') {
    this.baseURL = base || ''
  }

  get (rule, aspect) {
    return route('GET', path.join(this.baseURL, rule), aspect)
  }

  post (rule, aspect) {
    return route('POST', path.join(this.baseURL, rule), aspect)
  }
}
