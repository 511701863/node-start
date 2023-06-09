import crypto from 'crypto'
import { setSession } from './session.js'

export async function login (DBName, ctx, { name, password }) {
  const userInfo = await DBName.get('SELECT * FROM user WHERE name = ?', name)
  const salt = 'xypte'
  const hash = crypto.createHash('sha256').update(`${salt}${password}`, 'utf8').digest().toString('hex') // 将用户输入的密码用同样的方式加密
  if (userInfo && hash === userInfo.password) {
    const data = { id: userInfo.id, name: userInfo.name }
    setSession(DBName, ctx, 'userInfo', data)
    return data
  }
  return null
}
