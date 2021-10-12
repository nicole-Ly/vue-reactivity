/**
 * observer
 * 1.劫持vue中data所有属性，并添加响应式(getter和setter)
 * 2.getter中将watcher添加到dep队列中进行暂存
 * 3.setter中通过调用dep的notify通知所有watcher更新视图
 */
class Observer{
  constructor(data) {
    this.walk(data);
  }
  walk(data) {
    if (!data || typeof data !== 'object') {
      return;
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data,key,data[key])
    })
  }
  defineReactive(data, key, value) {
    let self = this;
    let dep = new Dep();
    this.walk(value);//当value是对象时，递归遍历为每个属性都添加getter和setter

    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        // return data[key]; 在get直接调用data[key]会出现死循环，因此传入value
        Dep.target && dep.addSubs(Dep.target);//dep中注入watcher  Dep.target就是wather对象 
        return value; 
      },
      set(newValue) {
        if (newValue === value) {
          return
        }
        value = newValue;
        self.walk(newValue); //当给data重新赋值类型为对象时，需要递归遍历添加响应式
        dep.notify(newValue);//修改新值时，通知所有watcher
      }
    })
  }
}