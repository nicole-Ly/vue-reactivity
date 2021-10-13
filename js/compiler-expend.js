/**
 * Compiler 针对Dom节点的操作
 * 1.初始化vue时，找到Dom节点里插值表达式{{}}和指令(v-text和v-model)里的对应属性，配置上data里的属性，并进行替换
 * 1.添加数据监听更新视图：在对应处理节点中添加wather，当数据改变时通过wather里的回调拿到新值，从而更新视图
 * 2.添加页面监听更新vm.data：在处理元素节点，找到含有v-model等表单指令添加事件，监听页面改变并更新data里的属性
 */
 class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile (el) {
    let childNodes = el.childNodes
    // console.log(childNodes)
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }
      // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compileElement (node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        let key = attr.value
        const attrStr = attrName.substr(2).split(':')
        attrName = attrStr[0];
        let eventType = attrStr[1]||'';
        this.update(node, key, attrName,eventType)
      }
    })
  }

  update(node, key, attrName,eventType) {
    let updateFn = this[attrName + 'Updater']
    //  let value = eventType?this.vm[key]:this.vm.$options.methods[key]
    let value = this.filterValue(attrName,key);
    updateFn && updateFn.call(this, node, value, key,eventType)
  }

  // 处理 v-text 指令
  textUpdater (node, value, key) {
    node.textContent = value
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  // v-model
  modelUpdater (node, value, key) {
    node.value = value
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    // 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  //v-html
  htmlUpdater(node, value, key) {
    node.innerHTML = value;
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue;
    })
  }
  //v-on
  onUpdater(node, fun, key, eventType) {
    if (!eventType) return;
    node.addEventListener(eventType, () => {
      fun&&fun.call(this.vm);
    })
  }
  // 编译文本节点，处理差值表达式
  compileText (node) {
    // console.dir(node)
    // {{  msg }}
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])

      // 创建watcher对象，当数据改变更新视图
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
    }
   }
  /**
   * 获取不同指令对应的值
   * v-text v-moel从data中获取
   * v-on 从methods中获取
   */
   filterValue(attrName, key) {
    let result = '';
     switch (attrName) {
      case 'text':
      case 'model':
        result = this.vm[key]
        break;
      case 'on':
        result = this.vm.$options.methods[key]
        break;
      default:
        result = this.vm[key]
        break;
      }
    return result;
  }
  // 判断元素属性是否是指令
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }
  // 判断节点是否是文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }
  // 判断节点是否是元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
}