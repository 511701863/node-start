export async function getList (database, userInfo = { id: 1 }) {
  const result = await database.all(`SELECT * FROM todo WHERE state <> 2 and id = ${userInfo.id} ORDER BY state DESC`)
  return result
}

export async function addTask (database, userInfo, { text, state }) {
  try {
    const data = await database.run('INSERT INTO todo(text,state, id) VALUES (?, ?, ?)', text, state, userInfo.id)
    return { err: '', data }
  }
  catch (ex) {
    return { err: ex.message }
  }
}

export async function updateTask (database, { id, state }) {
  try {
    const data = await database.run('UPDATE todo SET state = ? WHERE id = ?', state, id)
    return { err: '', data }
  }
  catch (ex) {
    return { err: ex.message }
  }
}
