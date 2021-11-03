
const baseURL = 'https://www.olevod.com/index.php/vod/search/page/{1}/wd/{0}.html';

class SearchController extends Controller {

    load() {
        let str = localStorage['hints'];
        let hints = [];
        if (str) {
            let json = JSON.parse(str);
            if (json.push) {
                hints = json;
            }
        }
        this.data = {
            list: [],
            focus: false,
            hints: hints,
            text: '',
            loading: false,
        };
        this.hasMore = true;
    }

    makeURL(word, page) {
        return baseURL.replace('{0}', encodeURIComponent(word)).replace('{1}', page + 1);
    }

    onSearchClicked() {
        this.findElement('input').submit();
    } 

    onTextChange(text) {
        this.data.text = text;
    }

    async onTextSubmit(text) {
        let hints = this.data.hints;
        if (text.length > 0) {
            if (hints.indexOf(text) < 0) {
                this.setState(()=>{
                    hints.unshift(text);
                    while (hints.length > 30) {
                        hints.pop();
                    }
    
                    localStorage['hints'] = JSON.stringify(hints);
                });
            }
            
            this.setState(()=>{
                this.data.loading = true;
            });
            try {
                let list = await this.request(this.makeURL(text, 0));
                this.key = text;
                this.page = 0;
                this.hasMore = true;
                this.setState(()=>{
                    this.data.list = list;
                    this.data.loading = false;
                });
            } catch(e) {
                showToast(`${e}\n${e.stack}`);
                this.setState(()=>{
                    this.data.loading = false;
                });
            }
        }
    }

    onTextFocus() {
        this.setState(()=>{
            this.data.focus = true;
        });
    }

    onTextBlur() {
        this.setState(()=>{
            this.data.focus = false;
        });
    }

    onPressed(index) {
        var data = this.data.list[index];
        openVideo(data.link, data);
    }

    onHintPressed(index) {
        let hint = this.data.hints[index];
        if (hint) {
            this.setState(()=>{
                this.data.text = hint;
                this.findElement('input').blur();
                this.onTextSubmit(hint);
            });
        }
    }

    async onRefresh() {
        let text = this.key;
        if (!text) return;
        try {
            let list = await this.request(this.makeURL(text, 0));
            this.page = 0;
            this.hasMore = true;
            this.setState(()=>{
                this.data.list = list;
                this.data.loading = false;
            });
        } catch(e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    async onLoadMore() {
        if (!this.hasMore) return;
        let page = this.page + 1;
        try {
            let list = await this.request(this.makeURL(text, page));
            if (list.length == 0) {
                this.hasMore = false;
            }
            this.page = page;
            this.setState(()=>{
                for (let item in list) {
                    this.data.list.push(item);
                }
                this.data.loading = false;
            });
        } catch(e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    async request(url) {
        let res = await fetch(url);
        let html = await res.text();
        let doc = HTMLParser.parse(html);
        let nodes = doc.querySelectorAll('.vodlist > .searchlist_item');

        let results = [];
        for (let node of nodes) {
            let title_link = node.querySelector('.vodlist_title > a');
            let img_node = node.querySelector('.searchlist_img .vodlist_thumb');

            let item = {
                link: new URL(title_link.getAttribute('href'), url).toString(),
                title: title_link.getAttribute('title'),
                picture: new URL(img_node.getAttribute('data-original'), url).toString(),
                subtitle: node.querySelector('.vodlist_sub').text
            };
            results.push(item);
        }
        return results;
    }
}

module.exports = SearchController;