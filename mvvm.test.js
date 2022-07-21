import MVVM from "./src";
function renderHtml() {
    const div = document.createElement('div');
    div.setAttribute("id", "app");
    div.innerHTML = `
        <input type="text" v-model="message">
        <p>{{message}}</p>
        <h1 v-text="number"></h1>
        <button @click="handleClick">number++</button>
    `;
    document.body.appendChild(div);

    let vm = new MVVM({
        el: '#app',
        data: {
            message: 'hello world',
            number: 0,
            info: {
                a: 'this is info.a'
            }
        },
        methods: {
            handleClick: function () {
                this.number++;
            }
        }
    });
    return vm;
}

test('单项绑定({{}}) test', () => {
   let vm = renderHtml();
   vm.$data.message = "message";
   expect(document.querySelector('p').innerHTML).toBe('message');
});

test('双向绑定(v-model) test', () => {
    renderHtml();
    let input = document.querySelector('input');
    input.value = "message";
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent('input', true, true);
    input.dispatchEvent(evt);
    expect(document.querySelector('p').innerHTML).toBe('message');
});

test('事件绑定+单向绑定(v-text) test', () => {
    renderHtml();
    let button = document.querySelector('button');
    button.click();
    expect(document.querySelector('h1').innerHTML).toBe('1');
});