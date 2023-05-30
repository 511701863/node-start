import path from 'path'
import fs from 'fs'
import url from 'url'

let dataCache = null
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function loadData () {
  if (!dataCache) {
    const file = path.resolve(__dirname, '../data/data.json')
    const data = JSON.parse(fs.readFileSync(file))
    const reports = data.dailyReports // 数组格式的数据
    dataCache = {}
    // 把数组数据转换成以日期为key的JSON格式并缓存起来
    reports.forEach((report) => {
      if (report && report.updatedDate) {
        dataCache[report.updatedDate] = report
      }
    })
  }
  return dataCache
}

export function getCoronavirusKeyIndex () {
  return Object.keys(loadData())
}

export function getCoronavirusByDate (date) {
  const dailyData = loadData()[date] || {}
  if (dailyData.countries) {
    // 按照各国确诊人数排序
    dailyData.countries.sort((a, b) => {
      return b.confirmed - a.confirmed
    })
  }
  return dailyData
}
