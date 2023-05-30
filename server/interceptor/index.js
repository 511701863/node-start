export default class interceptor {
  constructor () {
    this.aspects = [] // 用于存储拦截切面
  }

  // 注册拦截切面
  use (interceptor) {
    this.aspects.push(interceptor)
    return this
  }

  // 执行注册的拦截切面
  async run (config) {
    const aspects = this.aspects
    // 将注册的拦截切面包装成一个洋葱模型
    const proc = aspects.reduceRight(function (a, b) {
      return async () => {
        await b(config, a)
      }
    }, () => Promise.resolve())
    try {
      // 从外到里执行这个洋葱模型
      await proc()
    }
    catch (e) {
      console.error(e)
    }
    return config
  }
}
