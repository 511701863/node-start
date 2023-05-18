import http from 'http'
const responseData = {
  ID: '001',
  Name: '姓名',
  age: 12
}
function toHtml (data) {
  return `
    <ul>
      <li><span>账号：</span><span>${data.ID}</span></li>
      <li><span>昵称：</span><span>${data.Name}</span></li>
      <li><span>注册时间：</span><span>${data.age}</span></li>
    </ul>`
}
export const server = http.createServer((req, res) => {
  const { pathname } = new URL(`http://${req.headers.host}${req.url}`)
  const accept = req.headers.accept
  if (pathname === '/') {
    if (accept.indexOf('application/json') === -1) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(toHtml(responseData))
    }
    else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('hello world')
    }
  }
  else if (pathname === '/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(responseData))
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>404 NotFound</h1>')
  }
})

server.on('clientError', (err, socket) => {
  console.log(err)
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen({ port: 8080, host: '127.0.0.1' }, () => {
  console.log('connection success', server.address())
})
