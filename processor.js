
function base64decode(str) {
    return Buffer.from(str, 'base64').toString();
}

class VideoProcesser extends Processor {
    async load(data) {
        this.value = {
            title: data.title,
            subtitle: data.subtitle,
            link: data.link,
        };
        let res = await fetch(data.link);
        let doc = HTMLParser.parse(await res.text());
        
        let summary = doc.querySelector('.content_desc.full_text > span').text;

        let playlist = doc.querySelector('ul.content_playlist');
        let list = playlist.querySelectorAll('li > a');

        let items = [];
        for (let node of list) {
            items.push({
                title: node.text,
                key: new URL(node.getAttribute('href'), data.link).toString(),
            });
        }

        this.value = {
            description: summary,
            items: items,
        };
    }

    async getVideo(key, data) {
        var cache = localStorage[`video:${key}`];
        if (cache) {
            return JSON.parse(cache);
        }

        let url = key;
        console.log("req " + url);
        let response = await fetch(url);
        let doc = HTMLParser.parse(await response.text());
        console.log("complete " + url);

        let scripts = doc.querySelectorAll('script:not([src])');

        let items = [];
        for (let script of scripts) {
            let text = script.text;
            let res = text.match(/^var (player_\w+)/);
            if (res) {
                let pd = null;
                eval(text.replace(/var player_\w+/, 'pd'));
                let data = pd;
                let item = {
                    title: 'v1',
                    url: data.url
                };
                items.push(item);
                break;
            }
        }
        localStorage[`video:${key}`] = JSON.stringify(items);
        return items;

    }

    async getResolution(data) {

    }

    clearVideoCache(key) {
        localStorage.removeItem(`video:${key}`);
    }
}

module.exports = VideoProcesser;