
const {Collection} = require('./collection');

class HomeCollection extends Collection {

    constructor(data) {
        super(data);
        this.page = 0;
    }

    async fetch(url) {
        let pageUrl = new PageURL(url);

        let doc = await super.fetch(url);
        let elems = doc.querySelectorAll('.vodlist li.vodlist_item');

        let results = [];

        for (let i = 0, t = elems.length; i < t; ++i) {
            let elem = elems[i];

            let item = glib.DataItem.new();
            let img_link = elem.querySelector('.vodlist_thumb');

            item.title = img_link.attr('title');
            item.link = pageUrl.href(img_link.attr('href'));
            item.picture = pageUrl.href(img_link.attr('data-original'));
            item.subtitle = elem.querySelector('.vodlist_sub').text.trim();
            results.push(item);
        }
        return results;
    }

    makeURL(page) {
        return this.url.replace('{0}', page + 1);
    }

    reload(_, cb) {
        let page = 0;
        this.fetch(this.makeURL(page)).then((results)=>{
            this.page = page;
            this.setData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }

    loadMore(cb) {
        let page = this.page + 1;
        this.fetch(this.makeURL(page)).then((results)=>{
            this.page = page;
            this.appendData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }
}

module.exports = function(info) {
    let data = info.toObject();
    return HomeCollection.new(data);
};
