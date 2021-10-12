/**
 * dep
 * 1.保存所有watcher
 * 2.生成notify方法，用来通知所有watcher,并将新值传递给它
 * 
 */
 class Dep {
  constructor () {
    // 存储所有的观察者
    this.subs = []
  }
  // 添加观察者
  addSub (sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 发送通知
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}