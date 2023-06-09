const sessionKey = 'userId'

// 根据Cookie中的ID获取用户的Session
export async function getSession (database, ctx, name) {
  const key = ctx.cookie[sessionKey]
  if (key) {
    const now = Date.now()
    const session = await database.get('SELECT * FROM Session WHERE key = ? and name = ? and expires > ?',
      key, name, now)
    if (session) {
      return JSON.parse(session.value)
    }
  }
  return null
}
// 创建新的Session
export async function setSession (database, ctx, name, data) {
  try {
    const key = ctx.cookie[sessionKey]
    if (key) {
      let result = await database.get('SELECT id FROM Session WHERE key = ? AND name = ?', key, name)
      if (!result) {
        // 如果result不存在，那么插入这个session
        result = await database.run(`INSERT INTO Session(key, name, value, created, expires)
          VALUES (?, ?, ?, ?, ?)`,
        key,
        name,
        JSON.stringify(data),
        Date.now(),
        Date.now() + 7 * 86400 * 1000)
      }
      else {
        // 否则更新这个session
        result = await database.run('UPDATE Session SET value = ?, created = ?, expires = ? WHERE key = ? AND name = ?',
          JSON.stringify(data),
          Date.now(),
          Date.now() + 7 * 86400 * 1000,
          key,
          name)
      }
      return { err: '', result }
    }
    throw new Error('invalid cookie')
  }
  catch (ex) {
    return { err: ex.message }
  }
}
