import Watcher from "./watcher";

export default class Compiler{
    constructor(context) {
        this.$el = context.$el;
        this.context = context;
        if (this.$el) {
            // 把原始dom转换为文档片段
            this.$fragment = this.nodeToFragment(this.$el);
            // 编译模板
            this.compiler(this.$fragment);
            // 把文档片段添加到页面中
            this.$el.appendChild(this.$fragment);
        }
    }

    /**
     * 把所有的元素转为文档片段
     * @param node
     */
    nodeToFragment(node) {
        let fragment = document.createDocumentFragment();
        if (node.childNodes && node.childNodes.length) {
            Array.from(node.childNodes).forEach(child => {
                // 判断是不是需要添加的节点
                // 注释节点或者无用的换行是不添加的
                if(!this.ignorable(child)) {
                    // console.log(child);
                    fragment.appendChild(child);
                }
            })
        }
        return fragment;
    }

    /**
     * 忽略哪些节点不添加到文档片段
     * 注释,无用空行
     * @param node
     */
    ignorable(node) {
        let reg = /\{\{([^}]+)}}/;
        return (
            node.nodeType === 8 || (node.nodeType === 3 && !reg.test(node.textContent))
        );
    }

    /**
     * 模板编译
     * @param node
     */
    compiler(node) {
        if(node.childNodes && node.childNodes.length) {
            node.childNodes.forEach(child => {
                if (child.nodeType === 1) {
                    // 说明是元素节点
                    this.compilerElementNode(child);
                } else if (child.nodeType === 3) {
                    // 说明是文本节点
                    this.compilerTextNode(child);
                }
            });
        }
    }

    /**
     * 编译元素节点
     * @param node
     */
    compilerElementNode(node) {
        // 完成元素的编译,指令等
        let that = this;
        let attrs = [...node.attributes];
        attrs.forEach(attr => {
            let {
                name: attrName,
                value: attrValue
            } = attr;
            if (attrName.indexOf("v-") === 0) {
                let dirName = attrName.slice(2);
                switch (dirName) {
                    case "text":
                        new Watcher(attrValue, this.context, newValue => {
                            node.textContent = newValue;
                        });
                        break;
                    case "model":
                        new Watcher(attrValue, this.context, newValue => {
                            node.value = newValue;
                        });
                        node.addEventListener("input", e => {
                            that.context[attrValue] = e.target.value;
                        })
                        break;
                }
            }
            if (attrName.indexOf("@") === 0) {
                this.compilerMethods(this.context, node, attrName, attrValue);
            }
        })
        this.compiler(node);
    }

    /**
     * 函数编译
     * @param scope
     * @param node
     * @param attrName
     * @param attrValue
     */
    compilerMethods(scope, node, attrName, attrValue) {
        //获取类型
        let type = attrName.slice(1);
        let fn = scope[attrValue];
        node.addEventListener(type, fn.bind(scope));
    }

    /**
     * 编译文本节点
     * @param node
     */
    compilerTextNode(node) {
        let text = node.textContent.trim();
        if (text) {
            // 把text字符串转换为表达式
            let exp = this.parseTextExp(text);
            // 添加订阅者, 计算表达式的值
            // 当表达式依赖的数据发生变化时
            // 1. 重新计算表达式的值
            // 2. node.textContent给最新的值
            new Watcher(exp, this.context, (newValue) => {
                node.textContent = newValue;
            });
        }
    }

    /**
     * 该函数完成文本到表达式的转换
     * @param text
     */
    parseTextExp(text) {
        // 匹配插值表达式正则
        let regText = /\{\{(.+?)}}/g
        // 分割插值表达式前后内容
        let pieces = text.split(regText);
        // 匹配插值表达式
        let matches = text.match(regText);
        // 表达式数组
        let tokens = [];
        pieces.forEach(item => {
            if (matches) {
                matches.forEach(match => {
                    if (String(match).indexOf("{{" + String(item) + "}}") === -1) {
                        tokens.push('("' + item + '")');
                    } else {
                        tokens.push('(' + item + ')');
                    }
                })
            } else {
                tokens.push("`" + item + "`");
            }
        });
        return tokens.join("+");
    }
}