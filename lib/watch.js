import readline from 'readline'
// let sum = 0
// process.stdin.setEncoding('utf-8')
// process.stdin.on('readable', () => {
//   const chunk = process.stdin.read()
//   const value = Number(chunk.slice(0, -1))
//   sum += value
//   if (value === 0) process.stdin.emit('end')
//   process.stdin.read()
// })

// process.stdin.on('end', () => {
//   console.log('求和结果是:' + sum)
// })
function question (r1, { text, value }) {
  const q = `${text}(${value})\n`
  return new Promise(resolve => {
    r1.question(q, answer => {
      resolve(answer || value)
    })
  })
}
export async function interact (questions = options) {
  const r1 = readline.createInterface({
    output: process.stdout,
    input: process.stdin
  })
  const answers = []
  for (let i = 0; i < questions.length; i++) {
    const answer = await question(r1, questions[i])
    answers.push(answer)
  }
  r1.close()
  return answers
}
const options = [
  { text: '请输入文章主题', value: '标题' },
  { text: '请输入最小字数', value: 6000 },
  { text: '请输入最大字数', value: 10000 }
]
