import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { generate, loadCorpus } from './lib/generator.js'
import moment from 'moment'
import { randomPick } from './lib/random.js'
import commandLineArgs from 'command-line-args'
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
  { name: 'max', alias: 'x', type: Number }
]
const options = commandLineArgs(optionDefinitions)
console.log(options.title)
const article = generate(corpus.title, { ...options, corpus })

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
const title = options.title || randomPick(corpus.title)()
const output = saveCorpus(title, article)
console.log(`生成成功！文章保存于：${output}`)
