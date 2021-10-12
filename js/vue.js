/**
 * 1.初始化 $el $option $data
 * 2.将data中数据代理到vue上来并添加响应式，这样每个Vue实例上都能通过this.msg方式获取数据,而不是this.data.msg
 * 3.调用observer：劫持data中属性
 * 4.调用compiler：解析dom节点，找到dom中存在data属性的地方
 * 
 */
class Vue{
  constructor(options) {
    this.$options = options;
    this.$data = options.data || {};

    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el  //el可能是字符串或vnode对象 ,返回元素对象
    this._proxyData(this.$data)
    
    new Observer(this.$data)
    new Compiler(this)
  }
  _proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        configurable:true,
        enumerable: true,
        get() {
          return data[key]
        },
        set(newVal) {
          data[key] = newVal;
        }
      })
    })
  }
}