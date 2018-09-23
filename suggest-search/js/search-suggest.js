//另外的一些实现方法：https://github.com/benjisg/js-suggest/blob/master/suggest.js?1534325157922、https://github.com/lzwme/jquery_search_suggest_plugin/blob/master/src/js/search-suggest.js?1534337053930


class Search {
    constructor(options) {
        const defaultOptions = {
            wrap: '',
            input: '',
            delay: 3000,
            callback: () => {},
        };
        this.options = Object.assign(defaultOptions, options);
        this.input = this.options.input;
        this.delay = this.options.delay;
        this.callback = this.options.callback;
    }
    insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    init() {
        let ul = document.createElement('ul');
        let ls = document.getElementById('ls');
        ul.id = 'ul-suggest';
        ul.innerHTML = '';
        this.insertAfter(ul, this.input);
        let _this = this;
        this.input.addEventListener('input', function() {
            let val = encodeURI(_this.input.value);
            console.log('input: ', val);
            ul.innerHTML = '';
            _this.jsonp({
                url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=' + val + '&cb=',
                time: _this.delay,
                callback: function(json) {
                    let text = '';
                    for (let i = 0; i < json.s.length; i++) {
                        text += '<li class="li-suggest">' + json['s'][i] + '</li>';
                    }
                    ul.innerHTML = text;
                    var li = document.getElementsByClassName('li-suggest')
                    _this.keyboard(li);
                    console.log('get data')
                },
                fail: function(e) {
                    alert(e);
                }
            });
        });
        this.input.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ls.style.display = 'block';
            this.getHistory();
        });

        document.addEventListener('click', (e) => {
            ls.style.display = 'none';
            ul.style.display = 'none';
        })
        document.addEventListener('keydown', (e) => {
            ls.style.display = 'none';
            if (e.keyCode === 13) {
                this.setHistory(this.input.value);
            }
        })
    }
    jsonp(objects) {
        objects = Object.assign(objects, {});
        if (!objects.url || !objects.callback) {
            throw new Error('The params are illegal');
        }
        let callbackName = ('jsonp_' + Math.random()).replace('.', '');
        let script = document.createElement('script');
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(script);

        window[callbackName] = function(json) {
            body.removeChild(script);
            clearTimeout(script.timer);
            window[callbackName] = null;
            objects.callback && objects.callback(json);
        };
        script.src = objects.url + callbackName;
        if (objects.time) {
            script.timer = setTimeout(() => {
                window[callbackName] = null;
                body.removeChild(script);
                objects.fail && objects.fail('Timeouts');
            }, objects.time);
        }
    }
    findIndex(node) {
        var children = node.parentNode.childNodes;
        var num = 0;
        for (var i = 0; i < children.length; i++) {
            if (children[i] == node) return num;
            if (children[i].nodeType == 1) num++;
        }
        return -1;
    }
    hasClass(element, className) { //尝试函数式
        return element.className.indexOf(className) > -1;
    }
    keyboard(li) {
        li = Array.from(li);
        let flag = li.every((item) => {
            return this.hasClass(item, 'active');
        });
        let len = li.length;
        let _this = this;
        let index = -1;
        document.onkeydown = function(e) {
            let other = [];
            switch (e.keyCode) {
                case 38:
                    if (index > 0) {
                        li.forEach((item) => {
                            item.classList.remove('active')
                        })
                        index--;
                        li[index].classList.toggle('active');
                    } else {
                        index = len - 1;
                        li.forEach((item) => {
                            item.classList.remove('active')
                        })
                        li[index].classList.toggle('active');
                    }
                    if (index >= 0)
                        document.getElementsByClassName('inputBar')[0].value = li[index].innerHTML;
                    break;
                case 40:
                    if (index < len - 1) {
                        li.forEach((item) => {
                            item.classList.remove('active')
                        })
                        index++;
                        li[index].classList.toggle('active');
                    } else {
                        index = 0;
                        li.forEach((item) => {
                            item.classList.remove('active')
                        })
                        li[0].classList.toggle('active');
                    }
                    if (index >= 0)
                        document.getElementsByClassName('inputBar')[0].value = li[index].innerHTML;
                    break;
                default:
                    break;
            }
        };
    }
    getHistory() {
        let history = localStorage.historyItems;
        let ls = document.getElementById('ls');
        let itemText = '';
        if (history === undefined) {
            itemText = '<p class="clearly">暂无搜索记录</p>';
            ls.innerHTML = itemText;
        } else {
            let str = new Array();
            str = history.split('|');
            str.forEach((item, index) => {
                itemText += '<div style="padding-top: 2px; padding-bottom:3px;"><a class="history-href" href="fake-search?keyword=' + item + '" >' + item + '</a>' + '<a href="" class="his" onclick="' + this.clearHistory() + '">清除</a>';
                if (itemText !== undefined)
                    ls.innerHTML = '<div class="history-item">' + itemText + '<div>';
            })

        }
    }
    setHistory(keyword) {
        let { historyItems } = localStorage;
        if (historyItems === undefined) {
            localStorage.historyItems = keyword;
        } else {
            historyItems = keyword + '|' + historyItems.split('|').filter(e => e != keyword).join('|');
            localStorage.historyItems = historyItems;
        }
    }
    clearHistory() {
        localStorage.removeItem('historyItems');
        let ls = document.getElementById('ls');
        while (ls.hasChildNodes()) {
            ls.removeChild(ls.firstChild);
        }
        ls.innerHTML = '<p class="clearly">暂无搜索记录</p>'
    }
}
