
const users = {}
export default async function userPage ({ cookie, route, res }, next) {
  res.setHeader('Content-Type', 'text/html;charset=utf-8')
  // 设置cookie
  let id = cookie.userId
  if (id) {
    users[id] = users[id] || 1
    users[id]++
    res.body = `<h1>Hello world login by ${users[id]}</h1>`
  }
  else {
    id = Math.random().toString(36).slice(2)
    users[id] = 1
    res.body = '<h1>你好，新用户</h1>'
  }
  res.setHeader('Set-Cookie', `userId=${id}; Max-Age=10`)
  await next()
}
