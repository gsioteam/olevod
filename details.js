
const {Collection} = require('./collection');

class DetailsCollection extends Collection {
    
    async fetch(url) {
        console.log(url);
        let pageUrl = new PageURL(url);
        let doc = await super.fetch(url);

        let info_data = this.info_data;
        info_data.summary = doc.querySelector('.content_desc.full_text > span').text;

        let playlist = doc.querySelector('ul.content_playlist');
        let list = playlist.querySelectorAll('li > a');

        let items = [];
        for (let node of list) {
            let item = glib.DataItem.new();
            item.title = node.text;
            item.link = pageUrl.href(node.attr('href'));
            items.push(item);
        }
        return items;
    }

    reload(_, cb) {
        this.fetch(this.url).then((results)=>{
            this.setData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }
}

module.exports = function(item) {
    return DetailsCollection.new(item);
};