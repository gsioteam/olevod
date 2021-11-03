class IndexController extends Controller {
    load() {
        this.data = {
            tabs: [
                {
                    "title": "电影",
                    "id": "movie",
                    "url": "https://www.olevod.com/index.php/vod/show/id/1/page/{0}.html"
                },
                {
                    "title": "连续剧",
                    "id": "tv",
                    "url": "https://www.olevod.com/index.php/vod/show/id/2/page/{0}.html"
                },
                {
                    "title": "综艺",
                    "id": "shows",
                    "url": "https://www.olevod.com/index.php/vod/show/id/3/page/{0}.html"
                },
                {
                    "title": "动漫",
                    "id": "anime",
                    "url": "https://www.olevod.com/index.php/vod/show/id/4/page/{0}.html"
                }
            ]
        };
    }
}

module.exports = IndexController;