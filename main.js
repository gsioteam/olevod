
class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;

        var cache = this.readCache();
        let list;
        if (cache) {
            list = cache.items;
        } else {
            list = [];
        }

        this.data = {
            list: list,
            loading: false,
        };

        if (cache) {
            let now = new Date().getTime();
            if (now - cache.time > 30 * 60 * 1000) {
                this.reload();
            }
        } else {
            this.reload();
        }
    }

    async onPressed(index) {
        var data = this.data.list[index];
        openVideo(data.link, data);
    }

    onRefresh() {
        this.reload();
    }

    onLoadMore() {
        this.setState(() => {
            this.data.loading = true;
        });

        let page = this.page + 1;
        let url = this.makeURL(page);
        let res = await fetch(url);
        let html = await res.text();
        this.page = page;
        let items = this.parseHtml(html, url);

        this.setState(()=>{
            for (let item of items) {
                this.data.list.push(item);
            }
            this.data.loading = false;
        });
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let res = await fetch(this.url);
            let html = await res.text();
            let items = this.parseHtml(html, this.url);
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    readCache() {
        let cache = localStorage['cache_' + this.id];
        if (cache) {
            let json = JSON.parse(cache);
            return json;
        }
    }

    parseHtml(html, url) {
        let doc = HTMLParser.parse(html);
        
        let elems = doc.querySelectorAll('.vodlist li');

        let results = [];

        for (let i = 0, t = elems.length; i < t; ++i) {
            let elem = elems[i];

            let img_link = elem.querySelector('.vodlist_thumb');

            let item = {
                title: img_link.getAttribute('title'),
                link: new URL(img_link.getAttribute('href'), url).toString(),
                picture: new URL(img_link.getAttribute('data-original'), url).toString(),
                subtitle: elem.querySelector('.vodlist_sub').text.trim(),
            };

            results.push(item);
        }
        return results;
    }
}

module.exports = MainController;