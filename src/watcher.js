import Dep from "./dep";

let $uid = 0;
export default class Watcher {
    constructor(exp, scope, cb) {
        this.exp = this.fixExp(exp);
        this.scope = scope;
        this.cb = cb;
        this.uid = $uid++;
        this.update();
    }

    /**
     * 将字符串中()变为('')
     * @param exp
     */
    fixExp(exp) {
        let newExp = "";
        for (let i = 0; i < exp.length; i++) {
            if (exp[i] === '(' && exp[i+1] === ')') {
                newExp += "(''";
            } else {
                newExp += exp[i];
            }
        }
        return newExp;
    }

    /**
     * 计算表达式
     */
    get() {
        Dep.target = this;
        let newValue = Watcher.computeExpression(this.exp, this.scope);
        Dep.target = null;
        return newValue;
    }

    /**
     * 完成回调函数的调用
     */
    update() {
        let newValue = this.get();
        this.cb && this.cb(newValue);
    }

    static computeExpression(exp, scope) {
        // 创建函数
        // 把scope当作作用域
        // 函数内部用with来指定作用域
        // 执行函数, 得到表达式的值
        let fn = new Function("scope", "with(scope){return " + exp + "}");
        return fn(scope);
    }
}