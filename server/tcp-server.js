import net from 'net'
// 创建 TCP 服务，监听端口，接受远程客户端的连接。
export const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const matched = data.toString('utf-8').match(/^GET ([/\w]+) HTTP/)
    if (matched) {
      const path = matched[1]
      if (path === '/') {
        socket.write(responseData('<h1>Hello world</h1>'))
      }
      else {
        socket.write(responseData('<h1>404 NotFound</h1>', 404, 'NotFound'))
      }
    }
    console.log(`DATA:\n\n${data}`)
  })
  socket.on('close', () => {
    console.log('connection closed, goodbye!\n\n\n')
  })
}).on('error', (err) => {
  throw err
})

server.listen({
  host: '127.0.0.1',
  port: 8080
}, () => {
  console.log('connection success', server.address())
})

function responseData (str, status = 200, desc = 'ok') {
  return `HTTP/1.1 ${status} ${desc}
Connection: keep-alive
Date: ${new Date()}
Content-Length: ${str.length}
Content-Type: text/html

${str}`
}
