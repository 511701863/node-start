export async function getList (database) {
  const result = await database.all('SELECT * FROM todo WHERE state != 2')
  return result
}

export async function addTask (database, { text, state }) {
  try {
    const data = await database.run('INSERT INTO todo(text,state) VALUES (?, ?)', text, state)
    console.log(data, 1234)
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

export async function deleteTask (database, { id }) {
  try {
    const data = await database.run('DELETE FROM sc WHERE id = ?', id)
    return { err: '', data }
  }
  catch (ex) {
    return { err: ex.message }
  }
}
