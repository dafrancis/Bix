/*!
 * Bix - A JavaScript Routing Library
 * Copyright (C) 2012 Dafydd Francis 
 * MIT Licensed
 */

/**
 * A private namespace to set things up against the global object.
 */
(function () {
    /**
     * Creates an instance of Bix.
     *
     * @constructor
     * @this {Bix}
     * @param {Object} url An object containing some routes and the functions associated with them.
     */
    var Bix = function (urls) {
        this.urls = urls;
        this.error = function (e) {
            console.log("Bix. Routing Error: ", e);
        };
        this.root = '/';
        this.forceHash = false;
        this.hashBang = true;
    };

    /**
     * Tries to see if the current url matches with a route and
     * runs the associated function if it does. If not it returns
     * null.
     *
     * @this {Bix}
     * @param {String} map The route to match against.
     * @param {String} splat The current url for comparison.
     */
    Bix.prototype.route = function(map, splat){
        var i,
        params = [],
        callback = this.urls[map];
        map = map.split('/');
        splat = (splat || '/').split('/');
        if (splat.length !== map.length) {
            return null;
        }
        for (i = 1; i < splat.length; i++) {
            var marker = map[i];
            if(marker[0] === ':') {
                params.push(splat[i]);
            } else if (marker !== splat[i]) {
                return null;
            }
        }
        return callback.apply(null, params);
    };

    /**
     * Runs through all the urls trying to match the current
     * url with the routes. If there is a match then that is
     * returned otherwise the error handler gets a status 404
     *
     * @this {Circle}
     * @param {String} slug The current url to try and match to one of the routes.
     */
    Bix.prototype.matchUrl = function (slug) {
        var url,
        base = this,
        urls = this.urls;
        for (url in urls) {
            if (urls.hasOwnProperty(url)) {
                var output = base.route(url, slug);
                if (output !== null) {
                    return output;
                }
            }
        }
        base.error({status: 404});
    };  

    /**
     * Starts up Bix to use HTML5's pushStates for url changes.
     *
     * @this {Bix}
     */
    Bix.prototype.pushStates = function () {
        var i, 
        urls = document.getElementsByTagName("a"),
        base = this,
        clickEvent = function () {
            var slug = this.hash.split('/');
            slug.shift();
            slug = base.root + slug.join('/');
            window.history.pushState({}, null, slug);
            base.matchUrl(slug.replace(new RegExp("^" + base.root), '/'));
            return false;
        };
        for (i = 0; i < urls.length; i++) {
            var url = urls[i];
            if (url.hash.length > 0) {
                urls[i].onclick = clickEvent;
            }
        }
        base.matchUrl(window.location.pathname.replace(new RegExp("^" + base.root), '/'));
    };

    /**
     * Starts up Bix to use classic hash urls.
     *
     * @this {Bix}
     */
    Bix.prototype.hashchange = function () {
        var base = this;
        window.onhashchange = function () {
            base.matchUrl(window.location.hash);
        };
        if (location.pathname === base.root) {
            window.onhashchange();
        } else {
            var hash = base.hashBang ? '#!' : '#';
            hash += location.pathname.replace(new RegExp("^" + this.root), '/');
            window.onhashchange = function () {};
            location.hash = hash;
            location.pathname = base.root;
        }
    };

    /**
     * A Bix factory which is added to the global namespace.
     *
     * @param {Object} url An object containing some routes and the functions associated with them.
     */
    window.Bix = function (urls) {
        urls = urls || {};
        var bix = new Bix(urls);
        return {
            /**
             * Adds another url to the list of urls.
             *
             * @param {String} url An url representation of a route.
             * @param {Function} func An function to call when this url is matched.
             */
            add: function (url, func) {
                bix.urls[url] = func;
            },
            /**
             * Starts Bix. If the browser can do pushState then it will default to
             * that, otherwise it will use hash urls. Hash urls can also be forced
             * in the config
             */
            run: function () {
                if (!bix.forceHash && window.history.pushState !== undefined) {
                    bix.pushStates();
                } else {
                    bix.hashchange();
                }
            },
            /**
             * Lets you configure Bix how you want.
             *
             * The options available are:
             *     error : change the error handler
             *     root : allows you to set the root (Default '/')
             *     forceHash : allows you to force Bix into using hash urls (Default false)
             *     hashBang : allows you to choose wether you want the urls to be hashbangs or not (Default true)
             *
             * @param {object} options Object with a set of options for bix.
             */
            config: function (options) {
                var option;
                for (option in options) {
                    if (options.hasOwnProperty(option)) {
                        bix[option] = options[option];
                    }
                }
            }
        };
    };
}());
