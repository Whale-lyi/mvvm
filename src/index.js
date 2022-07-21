import Observer from "./observer";
import Compiler from "./compiler";

export default class MVVM{
    constructor(options) {
        //将可用的东西挂载在实例上
        this.$el = document.querySelector(options.el);
        this.$data = options.data || {};
        this.$methods = options.methods || {};
        // 数据和函数的代理
        this._proxyData(this.$data);
        this._proxyMethods(this.$methods);
        //数据劫持
        new Observer(this.$data);
        //模板编译
        new Compiler(this);
    }

    /**
     * 数据的代理
     * @param data
     */
    _proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                set(newValue) {
                    data[key] = newValue;
                },
                get() {
                    return data[key];
                }
            })
        });
    }

    /**
     * 函数的代理
     * @param methods
     */
    _proxyMethods(methods) {
        if(methods && typeof methods === "object") {
            Object.keys(methods).forEach(key => {
                this[key] = methods[key];
            })
        }
    }
}
window.MVVM = MVVM;