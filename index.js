import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { generate, loadCorpus, usage } from './lib/generator.js'
import moment from 'moment'
import { randomPick } from './lib/random.js'
import commandLineArgs from 'command-line-args'
import { interact } from './lib/watch.js'
const [corpus, __dirname] = loadCorpus('./corpus/data.json')
// fs.appendFile(importPath, 'Hello World', (err) => {
//   console.log(err)
// })
// fs.stat(importPath, (err, Stats) => {
//   console.log(Stats)
// })
const optionDefinitions = [
  { name: 'title', alias: 't', type: String },
  { name: 'min', alias: 'm', type: Number },
  { name: 'max', alias: 'x', type: Number },
  { name: 'help' }
]
const options = commandLineArgs(optionDefinitions)

function saveCorpus (title, article) {
  const outputDir = resolve(__dirname, 'output')
  const time = moment().format('x')
  // 检查outputDir是否存在，没有则创建一个
  if (!existsSync(outputDir)) {
    // 创建目录
    mkdirSync(outputDir)
  }
  const outputFile = resolve(outputDir, `${title}${time}.txt`)

  const text = `${title}\n\n${article.join('\n\n')}`
  // 将文章写入文件
  writeFileSync(outputFile, text, { encoding: 'utf-8' })
  return outputDir
}
let title = options.title || randomPick(corpus.title)()

async function createText () {
  if (Object.keys(options).length <= 0) {
    const answers = await interact()
    title = answers[0]
    options.min = answers[1]
    options.max = answers[2]
    console.log(options)
  }
  const article = generate(title, { ...options, corpus })
  if ('help' in options) {
    console.log(usage)
    process.exit(0)
  }
  const output = saveCorpus(title, article)
  console.log(`生成成功！文章保存于：${output}`)
}
createText()
