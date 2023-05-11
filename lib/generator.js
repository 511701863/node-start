import { randomInt, randomPick, sentence } from './random.js'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import commandLineUsage from 'command-line-usage'
const url = import.meta.url

export function generate (title, {
  corpus,
  min = 6000, // 文章最少字数
  max = 10000 // 文章最多字数
} = {}) {
  // 将文章长度设置为 min 到 max之间的随机数
  const articleLength = randomInt(min, max)
  const { famous, boshBefore, bosh, said, conclude } = corpus
  const [pickFamous, pickBoshBefore, pickBosh, pickSaid, pickConclude] = [famous, boshBefore, bosh, said, conclude].map((item) => {
    return randomPick(item)
  })

  const article = []
  let totalLength = 0

  while (totalLength < articleLength) {
    // 如果文章内容的字数未超过文章总字数
    let section = '' // 添加段落
    const sectionLength = randomInt(200, 500) // 将段落长度设为200到500字之间
    // 如果当前段落字数小于段落长度，或者当前段落不是以句号。和问号？结尾
    while (section.length < sectionLength || !/[。？]$/.test(section)) {
      // 取一个 0~100 的随机数
      const n = randomInt(0, 100)
      if (n < 20) { // 如果 n 小于 20，生成一条名人名言，也就是文章中有百分之二十的句子是名人名言
        section += sentence(pickFamous, { said: pickSaid, conclude: pickConclude })
      }
      else if (n < 50) {
        // 如果 n 小于 50，生成一个带有前置从句的废话
        section += sentence(pickBoshBefore, { title }) + sentence(pickBosh, { title })
      }
      else {
        // 否则生成一个不带有前置从句的废话
        section += sentence(pickBosh, { title })
      }
    }
    // 段落结束，更新总长度
    totalLength += section.length
    // 将段落存放到文章列表中
    article.push(section)
  }

  // 将文章返回，文章是段落数组形式
  return article
}

export function parseOptions (options = {}) {
  // command-line-args 替代 process.argv
  const args = process.argv
  for (let i = 2; i < args.length; i++) {
    const cmd = args[i - 1]
    const value = args[i]
    if (cmd === '--title') {
      options.title = value
    }
    else if (cmd === '--min') {
      options.min = Number(value)
    }
    else if (cmd === '--max') {
      options.max = Number(value)
    }
  }
  return options
}

export function loadCorpus (path) {
  const __dirname = dirname(dirname(fileURLToPath(url)))
  const dataPath = resolve(__dirname, path)
  return [JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf-8' })), __dirname]
}

// 定义帮助的内容
const sections = [
  {
    header: '文章生成器',
    content: '生成随机的文章段落用于测试'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'title',
        typeLabel: '{underline string}',
        description: '文章的主题。'
      },
      {
        name: 'min',
        typeLabel: '{underline number}',
        description: '文章最小字数。'
      },
      {
        name: 'max',
        typeLabel: '{underline number}',
        description: '文章最大字数。'
      }
    ]
  }
]
export const usage = commandLineUsage(sections) // 生成帮助文本
