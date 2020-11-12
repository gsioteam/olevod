const {Collection} = require('./collection');

class VideoCollection extends Collection {

    async fetch(url) {
        let doc = await super.fetch(url);
        let scripts = doc.querySelectorAll('script:not([src])');

        let items = [];
        for (let script of scripts) {
            let text = script.text;
            let res = text.match(/^var (player_\w+)/);
            if (res) {
                let name = res[1];
                let ctx = glib.ScriptContext.new('v8');
                ctx.eval(text);
                let data = ctx.eval(name).toObject();
                let item = glib.DataItem.new();
                item.link = url;
                item.data = {
                    url: data.url
                };
                console.log("res " + data.url);
                items.push(item);
                break;
            }
        }
        console.log("fetch " + items.length);
        return items;
    }

    reload(_, cb) {
        console.log("reload");
        this.fetch(this.url).then((results)=>{
            console.log("setData " + results.length);
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
    return VideoCollection.new(item);
};