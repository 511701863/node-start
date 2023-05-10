export function randomInt (min, max) {
  const n = Math.random()
  return Math.floor(min * (1 - n) + max * n)
}

export function randomPick (arr) {
  arr = [...arr]
  return function () {
    const index = randomInt(1, arr.length)
    const picked = arr[index];
    [arr[0], arr[index]] = [arr[index], arr[0]]
    return picked
  }
}

export function sentence (pick, replacer) {
  let ret = pick() // 返回一个句子文本
  for (const key in replacer) { // replacer是一个对象，存放替换占位符的规则
    // 如果 replacer[key] 是一个 pick 函数，那么执行它随机取一条替换占位符，否则将它直接替换占位符
    ret = ret.replace(new RegExp(`{{${key}}}`, 'g'),
      typeof replacer[key] === 'function' ? replacer[key]() : replacer[key])
  }
  return ret
}
