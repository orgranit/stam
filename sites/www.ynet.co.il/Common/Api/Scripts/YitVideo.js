window.YitVideo = {
    version:'03.00',
    videoApiO: { 
        ynet:"https://www.ynet.co.il/3rdparty/mobile/json/video/#video_id#/",
        calcalist:"https://www.calcalist.co.il/3rdparty/mobile/json/video/#video_id#/",
        ctech:"https://www.calcalist.co.il/3rdparty/mobile/json/video/eng/#video_id#/"
    },
    fallbackResourcesLaoded: false,
    fallbackPlayer: false,
    lang: ( document.querySelector('html').getAttribute('lang') ? document.querySelector('html').getAttribute('lang') :  "he"),
    logo: "/images/favicon/favicon_1.ico", 
    players: {},
    contentTypes:{
        mp4:'video/mp4',
        m3u8:'application/x-mpegurl'
    },
    currentFloatingPlayer : {
        playerWrap:null,
        status:false
    },
    adTagUrl:"",
    autoEvents:false,
    nextVideo:false,
    icon:false,
    externalResources: {
        youtubeapi: "https://www.ynet.co.il/Common/Api/Scripts/youtube/youtube.css",
        youtubejs: "https://www.ynet.co.il/Common/Api/Scripts/youtube/youtube.js",
        youtubecss: "https://www.ynet.co.il/Common/Api/Scripts/youtube/youtube.css",
        jquery: "https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js",
        videojsima3: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
        videojshls: "https://www.ynet.co.il/Common/Api/Scripts/video/videojs-contrib-hls.js",
        videojsmin:"https://www.ynet.co.il/Common/Api/Scripts/video/video.min.js",
        videojscssmin: "https://www.ynet.co.il/Common/Api/Scripts/video/video-js.min.css",
        videojscssads: "https://www.ynet.co.il/Common/Api/Scripts/video/videojs.ads.css",
        videojscssima: "https://www.ynet.co.il/Common/Api/Scripts/video/videojs.ima.css",
        videojsads: "https://www.ynet.co.il/Common/Api/Scripts/video/videojs.ads.min.js",
        videojsima: "https://www.ynet.co.il/Common/Api/Scripts/video/videojs.ima.js",
        videojssiemamin:"https://www.ynet.co.il/Common/Api/Scripts/video/siema.min.js"
    },
    video_tracking_events : function(evnt,data) {
        try { 
            if (data.playerType == 'videojs' && this.autoEvents ) {
                        id = data.player.id_.split('player_')[1]
                        YitVideo.players[id].data.AnltmetaData['videoLength'] = this.toHHMMSS(data.duration);
                        var AnltmetaDataCore = YitVideo.players[id].data.AnltmetaData
                        var AnltmetaDataObj  = { Action   :this.capitalize(evnt),
                                                Category :'Video',
                                                event: 'video_events',
                                                Label: YitVideo.players[id].data.AnltmetaData.videoTitle
                        }
                            
                    Object.keys(AnltmetaDataCore).forEach(function (item) {
                            AnltmetaDataObj[item] = AnltmetaDataCore[item] ;
                    });
                    
                    if ( evnt == 'progress') {
                        var res = data.percentageSeen.match(/([0-9]+%)/)[0]
                        AnltmetaDataObj.Action = 'Played - ' + res ;
                    
                        if(data.percentageSeen.search('100')> 0){
                            YitVideo.players[id].data.AnltmetaData['ended'] = true ;
                        }
                    }

                    if ( evnt == 'pause' && YitVideo.players[id].data.AnltmetaData.ended  ) {
                        return;
                    }
                    
                    if ( evnt == 'ads-ad-started') {
                         AnltmetaDataObj.Action = 'Play - Ads'
                    }

                     if ( evnt == 'contentplay' ||  evnt == 'firstplay') {
                        if 	(!data.isAdblockEnabled) {	
                                if (evnt == 'contentplay' ) {
                                    AnltmetaDataObj.Action = 'Play - Video Starts'
                                    if  (typeof YitVideo.players[id].data.contentplay == 'undefined' ) {
                                        YitVideo.players[id].data.contentplay = false ;
                                    } else {
                                        return;
                                    }
                                } else { return ;}
                            } else {
                                if (evnt == 'contentplay') return;
                                AnltmetaDataObj.Action = (evnt == 'firstplay') ? 'Play - Video Starts' : 'Start ' ;
                            }
                    }
                    
                    if (typeof dataLayer == 'object'){
                        AnltmetaDataObj.Action =  AnltmetaDataObj.Action.charAt(0).toUpperCase() +  AnltmetaDataObj.Action.slice(1);
                        dataLayer.push(AnltmetaDataObj);
                    }  
            }
        }  catch(error) {}
    },
    capitalize : function(s)  {
        if (typeof s !== 'string') return ''
        if (s =='firstplay') s = 'start' ; 
            return s.charAt(0).toUpperCase() + s.slice(1)
    },
    toHHMMSS :function(secs) {
        var sec_num = parseInt(secs, 10)
        var hours   = Math.floor(sec_num / 3600)
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60
    
    return   [hours,minutes,seconds]
       .map(function(v){return v < 10 ? '0' + v : v})
       .filter(function(v,i) { return v !== '00' || i > 0})
       .join(':')
    },
    gvideoApi: function(idsobj) {
        name=this.options.siteName.toLowerCase();
        target = this.videoApiO;
        urlJson = target.hasOwnProperty(name) ? target[name] : "https://www.ynet.co.il/3rdparty/mobile/json/video/#video_id#/";
        urlJson = urlJson.replace("#video_id#",idsobj.videoid) ;
         if( (this.options.siteName.toLowerCase() == 'ctech'  || this.options.siteName.toLowerCase() == 'calcalist') && idsobj.articleidcontainer ) {
            urlJson = urlJson + idsobj.articleidcontainer.value + '/'
         }
        return urlJson ;
      },
    gLogo: function() { 
        return ( (document.querySelectorAll('link[href*="favi"]')[0] && document.querySelectorAll('link[href*="favi"]')[0].href ) ? document.querySelectorAll('link[href*="favi"]')[0].href : "https://www.ynet.co.il/images/favicon/favicon_1.ico" )     
    },
    LoadScriptAsync: function(uri) {

            return new Promise(function(resolve, reject) {
                if (uri.indexOf('.css') > -1) {
                    var tag = document.createElement('link');
                    tag.href = uri;
                    tag.rel = 'stylesheet';
                    tag.type = 'text/css';
                    tag.async = true;
                } else {
                    var tag = document.createElement('script');
                    tag.src = uri;
                    tag.async = true;
                }
                tag.onload = function() {
                    resolve();
                };
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
              });
        
        
    },
    AjaxAsync: function(options) {
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open(options.method, options.url);
            req.onload = function(){
                req.status === 200 ? resolve(JSON.parse(req.response)) : reject(Error(req.statusText));
            } 
            req.onerror  = function(e) {
                //reject(Error(`Network Error: ${e}`));
            }
            req.send();
        });
    },
    IfMobile: function(){
        if( navigator.userAgent.match(/Android/i) 
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)) {
            return true;
        }
        return false;
    },
    ContentType:function(type) {
        if (this.contentTypes[type] !== undefined) {
            return this.contentTypes[type];
        }else {
            return 'application/x-mpegurl';
        }
    },
    Constructor: function(options) {
        this.options = options;
        if (typeof Promise != "function") {
             !function n(t,e,r){function o(u,f){if(!e[u]){if(!t[u]){var c="function"==typeof require&&require;if(!f&&c)return c(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var l=e[u]={exports:{}};t[u][0].call(l.exports,function(n){var e=t[u][1][n];return o(e?e:n)},l,l.exports,n,t,e,r)}return e[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(n,t,e){"use strict";function r(){}function o(n){try{return n.then}catch(t){return d=t,w}}function i(n,t){try{return n(t)}catch(e){return d=e,w}}function u(n,t,e){try{n(t,e)}catch(r){return d=r,w}}function f(n){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof n)throw new TypeError("not a function");this._37=0,this._12=null,this._59=[],n!==r&&v(n,this)}function c(n,t,e){return new n.constructor(function(o,i){var u=new f(r);u.then(o,i),s(n,new p(t,e,u))})}function s(n,t){for(;3===n._37;)n=n._12;return 0===n._37?void n._59.push(t):void y(function(){var e=1===n._37?t.onFulfilled:t.onRejected;if(null===e)return void(1===n._37?l(t.promise,n._12):a(t.promise,n._12));var r=i(e,n._12);r===w?a(t.promise,d):l(t.promise,r)})}function l(n,t){if(t===n)return a(n,new TypeError("A promise cannot be resolved with itself."));if(t&&("object"==typeof t||"function"==typeof t)){var e=o(t);if(e===w)return a(n,d);if(e===n.then&&t instanceof f)return n._37=3,n._12=t,void h(n);if("function"==typeof e)return void v(e.bind(t),n)}n._37=1,n._12=t,h(n)}function a(n,t){n._37=2,n._12=t,h(n)}function h(n){for(var t=0;t<n._59.length;t++)s(n,n._59[t]);n._59=null}function p(n,t,e){this.onFulfilled="function"==typeof n?n:null,this.onRejected="function"==typeof t?t:null,this.promise=e}function v(n,t){var e=!1,r=u(n,function(n){e||(e=!0,l(t,n))},function(n){e||(e=!0,a(t,n))});e||r!==w||(e=!0,a(t,d))}var y=n("asap/raw"),d=null,w={};t.exports=f,f._99=r,f.prototype.then=function(n,t){if(this.constructor!==f)return c(this,n,t);var e=new f(r);return s(this,new p(n,t,e)),e}},{"asap/raw":4}],2:[function(n,t,e){"use strict";function r(n){var t=new o(o._99);return t._37=1,t._12=n,t}var o=n("./core.js");t.exports=o;var i=r(!0),u=r(!1),f=r(null),c=r(void 0),s=r(0),l=r("");o.resolve=function(n){if(n instanceof o)return n;if(null===n)return f;if(void 0===n)return c;if(n===!0)return i;if(n===!1)return u;if(0===n)return s;if(""===n)return l;if("object"==typeof n||"function"==typeof n)try{var t=n.then;if("function"==typeof t)return new o(t.bind(n))}catch(e){return new o(function(n,t){t(e)})}return r(n)},o.all=function(n){var t=Array.prototype.slice.call(n);return new o(function(n,e){function r(u,f){if(f&&("object"==typeof f||"function"==typeof f)){if(f instanceof o&&f.then===o.prototype.then){for(;3===f._37;)f=f._12;return 1===f._37?r(u,f._12):(2===f._37&&e(f._12),void f.then(function(n){r(u,n)},e))}var c=f.then;if("function"==typeof c){var s=new o(c.bind(f));return void s.then(function(n){r(u,n)},e)}}t[u]=f,0===--i&&n(t)}if(0===t.length)return n([]);for(var i=t.length,u=0;u<t.length;u++)r(u,t[u])})},o.reject=function(n){return new o(function(t,e){e(n)})},o.race=function(n){return new o(function(t,e){n.forEach(function(n){o.resolve(n).then(t,e)})})},o.prototype["catch"]=function(n){return this.then(null,n)}},{"./core.js":1}],3:[function(n,t,e){"use strict";function r(){if(c.length)throw c.shift()}function o(n){var t;t=f.length?f.pop():new i,t.task=n,u(t)}function i(){this.task=null}var u=n("./raw"),f=[],c=[],s=u.makeRequestCallFromTimer(r);t.exports=o,i.prototype.call=function(){try{this.task.call()}catch(n){o.onerror?o.onerror(n):(c.push(n),s())}finally{this.task=null,f[f.length]=this}}},{"./raw":4}],4:[function(n,t,e){(function(n){"use strict";function e(n){f.length||(u(),c=!0),f[f.length]=n}function r(){for(;s<f.length;){var n=s;if(s+=1,f[n].call(),s>l){for(var t=0,e=f.length-s;e>t;t++)f[t]=f[t+s];f.length-=s,s=0}}f.length=0,s=0,c=!1}function o(n){var t=1,e=new a(n),r=document.createTextNode("");return e.observe(r,{characterData:!0}),function(){t=-t,r.data=t}}function i(n){return function(){function t(){clearTimeout(e),clearInterval(r),n()}var e=setTimeout(t,0),r=setInterval(t,50)}}t.exports=e;var u,f=[],c=!1,s=0,l=1024,a=n.MutationObserver||n.WebKitMutationObserver;u="function"==typeof a?o(r):i(r),e.requestFlush=u,e.makeRequestCallFromTimer=i}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],5:[function(n,t,e){"function"!=typeof Promise.prototype.done&&(Promise.prototype.done=function(n,t){var e=arguments.length?this.then.apply(this,arguments):this;e.then(null,function(n){setTimeout(function(){throw n},0)})})},{}],6:[function(n,t,e){n("asap");"undefined"==typeof Promise&&(Promise=n("./lib/core.js"),n("./lib/es6-extensions.js")),n("./polyfill-done.js")},{"./lib/core.js":1,"./lib/es6-extensions.js":2,"./polyfill-done.js":5,asap:3}]},{},[6]);
        }

        if (this.options.autoEvents) {
            this.autoEvents = this.options.autoEvents;
        }
        if (this.options.nextVideo) {
            this.nextVideo = this.options.nextVideo;
        }
        if (this.options.icon && this.options.icon.length > 2 ) {
            this.icon = this.options.icon;
        }

        if (this.options.adTagUrl) {
            this.adTagUrl = this.options.adTagUrl;
        }
        
        if (!window.dcPath) {
            window.dcPath = this.options.dcPath;
        }
        this.logo=  this.gLogo();      
        var that = this;
        that.LoadScriptAsync(YitVideo.externalResources.youtubecss+'?v='+that.version);
        var scriptLoaded = that.LoadScriptAsync(YitVideo.externalResources.youtubeapi);
        scriptLoaded.then(function() {
            var scriptLoaded = that.LoadScriptAsync(YitVideo.externalResources.youtubejs+'?v='+that.version);
            scriptLoaded.then(function() {

                //hot fixes begin
                if (!window.jQuery) {
                    if (typeof yq == "undefined") { 
                        var scriptLoaded = that.LoadScriptAsync(YitVideo.externalResources.jquery);
                        scriptLoaded.then(function() {
                            jQuery.noConflict();
                            (function( $ ) {
                            $(function() {
                                window.yq = $;
                            });
                            })(jQuery);
                            try{
                                if(!$) {
                                    window.$ = jQuery;
                                }
                            }catch(e){}
                            
                        });
                    } 
                }

                if (typeof dataLayer == "undefined") {
                    window.dataLayer = [];
                }
                window.YnetYoutube = YnetYoutube;
                //hot fixes end
                that.InfrastructureReInitialize();
            });

        });
        return this;
    },
    GetUrlParameter: function(name){
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
    SendPixel: function (fallbackPlayer, this_player) {
          
        if (navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)) {
          var type = '4';
        } else {
          var type = '1';
        }
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = 'https://stats.ynet.co.il/popularity/popularity.php?content=' + fallbackPlayer.attributes["fallback-player"].value +
        '&type=' + type + '&time=' + this_player.duration()+ '&random=' + Math.random();
        document.body.appendChild(iframe);
    },
    InitPlayers: function(options) {
        var players = [];
        var that = this;
        if(window.YnetYoutube){
          window.YnetYoutube.onYouTubeIframeAPIReady();
        }
        
        
        if (this.fallbackPlayer) {
            this.LoadScriptAsync(YitVideo.externalResources.videojscssmin);
            this.LoadScriptAsync(YitVideo.externalResources.videojscssads);
            this.LoadScriptAsync(YitVideo.externalResources.videojscssima);

            var elem = document.createElement('div');
            elem.className = 'adclass';
            document.body.appendChild(elem);
            window.setTimeout(function () {
                that.isAdblockEnabled = !(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
                if (that.isAdblockEnabled) {
                    YitVideo.externalResources.videojsima = YitVideo.externalResources.videojshls;
                    YitVideo.externalResources.videojsads = YitVideo.externalResources.videojshls;
                    YitVideo.externalResources.videojsima3 = YitVideo.externalResources.videojshls;
                    
                }
            }, 0);

            var scriptLoaded = that.LoadScriptAsync(window.YitVideo.externalResources.videojsmin);
            scriptLoaded.then(function() {
                var scriptLoaded = that.LoadScriptAsync(window.YitVideo.externalResources.videojsima3);
                scriptLoaded.then(function() {
                    var scriptLoaded = that.LoadScriptAsync(window.YitVideo.externalResources.videojsads);
                    scriptLoaded.then(function() {
                        var scriptLoaded = that.LoadScriptAsync(window.YitVideo.externalResources.videojsima);
                        scriptLoaded.then(function() {
                            try{
                                google.ima.settings.setLocale(window.YitVideo.lang)
                            }catch(e){};
                            var scriptLoaded = that.LoadScriptAsync(YitVideo.externalResources.videojshls);
                            scriptLoaded.then(function() {
                                var fallbackPlayers = document.querySelectorAll("[fallback-player]");
                                [].forEach.call(fallbackPlayers, function(fallbackPlayer) {
                                    
                                    if(fallbackPlayer.getAttribute('player-type') == 'videosjs'){
                                        var videoOptions = that.players[fallbackPlayer.attributes["fallback-player"].value];

                                        if(fallbackPlayer.hasAttribute('initialized') && fallbackPlayer.getAttribute("initialized") == "true"){
                                            return true;
                                        }
                                        var playerContainerName = 'player_' + fallbackPlayer.attributes["fallback-player"].value;
                                        var ODataAttrbt = {
                                            //autoplay:(fallbackPlayer.attributes["at-play"].value === "true"),
                                            language: YitVideo.lang
                                        }

                                        Array.from(fallbackPlayer.attributes).forEach(function(e){
                                                if(e.name.search('data-') > -1) {
                                                   if(e.name.toLowerCase() == 'data-adtag'){
                                                    that.options.adTagUrl = e.value ;
                                                    that.adTagUrl = e.value ;
                                                    ref=false;						
                                                		if(window.top.document.referrer != "" && parent.performance.navigation.type != parent.PerformanceNavigation.TYPE_RELOAD){
                                                										ref = new URL(window.top.document.referrer).origin
                                                		}
                                                        iframeEl = fallbackPlayer;
                                                        AtforBtf = ( window.parent.innerHeight >  iframeEl.offsetTop  )  ? "ATF_"  : "BTF_" ;
                                                        rfrr =   ref   ? ( ref == window.location.origin   && window.top.location.href.search("#autoplay") > 0  )  ? true : false : false ;
                                                        intent = rfrr ?  ( AtforBtf == "ATF_"  )  ?  "intent" : false : false ; 
                                                        autoplay =   rfrr ?  ( AtforBtf == "ATF_"  )  ?  true  : false : false  ;
                                                        if(autoplay){
                                                          var rect = fallbackPlayer.getBoundingClientRect();
                                                          var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
                                                          autoplay = !(rect.bottom < 0 || rect.top - viewHeight >= 0);
                                                        }


                                                            if(!ref){
                                                                autoplay = false;  
                                                            }
                                                            var adtagMap = { 
                                                                intent: intent ,
                                                                AtforBtf : AtforBtf,
                                                                autoplay : autoplay
                                                            }
                                                      ODataAttrbt.autoplay = autoplay;
                                                      that.adtagurlBuild(adtagMap);
                                                } else {
                                                        k = e.name.replace('data-','') ;
                                                        val = e.value;
                                                        ODataAttrbt[k] = that.ParseBoolian(val);     
                                                    }
                                            }
                                        })
                                        
                                        
                                        
                                        var player_tmp = videojs(playerContainerName,ODataAttrbt);
                                        player_tmp.secondPrirol = (YitVideo.adTagUrl.search("first") > 0 ) ? false : false ;
                                        YitVideo.logobrand(player_tmp.el(),that.options.icon);
                                        if(videoOptions.data.ads){
                                            if(that.options.disableAds && that.options.disableAds == true) {
                                            } else {
                                                if(YitVideo.externalResources.videojsima3 != YitVideo.externalResources.videojshls){
                                                    var options = {
                                                        id: playerContainerName,
                                                        adTagUrl: that.options.adTagUrl,
                                                         timeout: 5000,
                                                         prerollTimeout: 2000,
                                                         
                                                    };
                                                    player_tmp.ima(options);
                                                }
                                            }




                                        }
                                        
                                        

                                        

                                        if (typeof that.options.eventsCallback == "function") {
                                            try {
                                                     
                                                        player_tmp.on("adend", function(){
                                                            
                                                            if (player_tmp.duration() == Infinity ) {
                                                                this.play();
                                                            }
                                                            
                                                            if (player_tmp.secondPrirol) {
                                                            player_tmp.secondPrirol = false ;
                                                            FadTag = player_tmp.ima.getAdsManager().I ;
                                                            SadTag = FadTag.replace("first","second") ;
                                                            player_tmp.ima.changeAdTag(SadTag);
                                                            player_tmp.ima.requestAds();
                                                            player_tmp.play();
                                                            }
                                                });

                                                  player_tmp.on("ads-ad-started", function() {
                                                    var this_player = this;
                                                    var data = {
                                                        'playerType': 'videojs',
                                                        'player' : this_player,
                                                        'duration' : this_player.duration(),
                                                        'isAdblockEnabled':that.isAdblockEnabled
                                                    }
                                                    that.options.eventsCallback('ads-ad-started',data );
                                                    that.video_tracking_events('ads-ad-started',data)
                                                })
                                                player_tmp.on("play", function() {
                                                    var this_player = this;
                                                    that.options.eventsCallback('play', {
                                                        'playerType': 'videojs',
                                                        'player' : this_player,
                                                        'duration' : this_player.duration()
                                                    });
                                                 
                                                    document.getElementById(this.id()).setAttribute('video_status','play');
                                                    that.pageRefreshEnableDisable('pageRefreshDisable');
                                                });

                                                player_tmp.on("timeupdate", function() {
                                                    var this_player = this;
                                                    var percentage = Math.round((this_player.currentTime() / this_player.duration()) * 100);
                                                    that.ReportProgress(percentage, this_player);
                                                    if(that.options.popularity && that.options.popularity == true && !this_player.popularity && percentage > 2 ) {
                                                        that.SendPixel(fallbackPlayer, this_player);
                                                        this_player.popularity = true;
                                                    }
                                                });
                                                 
                                                player_tmp.on("firstplay", function() {
                                                    var this_player = this;
                                                    var data = {
                                                        'playerType': 'videojs',
                                                        'event': 'video_start',
                                                        'related_url': document.referrer + '&dcPath=' + window.dcPath,
                                                        'video_url': this.options_.sources[0].src +'&source='+ window.dcSite,
                                                        'player' : this_player,
                                                        'duration' : this_player.duration(),
                                                        'isAdblockEnabled':that.isAdblockEnabled
                                                    }
                                                    that.options.eventsCallback('firstplay', data);
                                                    that.video_tracking_events('firstplay',data);
                                                    
                                                    if(that.options.popularity && that.options.popularity == true && !this_player.popularity && that.isAdblockEnabled) {
                                                        that.SendPixel(fallbackPlayer, this_player);
                                                        this_player.popularity = true;
                                                    }
					                                
                                                    document.getElementById(this.id()).setAttribute('video_status','firstplay');

                                                });
                                                

                                                player_tmp.on("contentplay", function() {
                                                    var this_player = this;
                                                    var data = {
                                                        'playerType': 'videojs',
                                                        'player' : this_player,
                                                        'duration' : this_player.duration(),
                                                        'isAdblockEnabled':that.isAdblockEnabled
                                                    } ;
                                                    that.options.eventsCallback('contentplay', data);
                                                    that.video_tracking_events('contentplay',data);
                                                    
                                                    if(that.options.popularity && that.options.popularity == true && !this_player.popularity) {
                                                        that.SendPixel(fallbackPlayer, this_player);
                                                        this_player.popularity = true;
                                                    }
                                                    

                                                    document.getElementById(this_player.id()).setAttribute('video_status','contentplay');
                                                });
                                                player_tmp.on("pause", function() {
                                                    var this_player = this;
                                                    var data = {
                                                        'playerType': 'videojs',
                                                        'player' : this_player,
                                                        'duration' : this_player.duration()
                                                    };
                                                    that.options.eventsCallback('pause',data );
                                                    that.video_tracking_events('pause',data);
                                                    document.getElementById(this_player.id()).setAttribute('video_status','pause');
                                                    clearTimeout(this_player.progressTimer);
                                                    that.pageRefreshEnableDisable('pageRefreshEnable');
                                                });
                                                player_tmp.on("ready", function() {
                                                    var this_player = this;
                                                    that.options.eventsCallback('ready', {
                                                        'playerType': 'videojs',
                                                        'player' : this_player
                                                    });
                                                });
 
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }
                                        players.push(player_tmp);
                                        fallbackPlayer.setAttribute('initialized','true');
                                        if (that.debug_mode) {
                                            that.cnslt(that.options.adTagUrl,player_tmp.options_)
                                        }

                                    }
                                });
                                that.videoJsPlayers = players;
                            });
                            if (YitVideo.options && typeof YitVideo.options.callback == "function") { 
                                YitVideo.options.callback();
                            }
                            if(that.options.flaotOnScroll && that.options.flaotOnScroll == true){
                              that.FloatingOnScroll();
                            }
                        });
                    });
                });
            });
        }
        try{
          that.IeInvalidUrlFix()
        } catch(e){}
        if(!YitVideo.IfMobile() && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
              setTimeout(function (){YitVideo.InfrastructureReInitialize();}, 2000);
        }                 
    }, 
    
    IeInvalidUrlFix: function() {
           try{
                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");
            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  
            {
                setTimeout(function() { 
                    videojs(document.querySelectorAll('.video-js')[0].id).tech_.hls.representations()
                }, 2000)
            } 
            
         } catch(e){}
        },
    ParseBoolian: function(Jvalue){
        Jvalue = Jvalue == 'true' ? true :  Jvalue == 'false' ? false :  Jvalue ;
        return  Jvalue ;
    },
    ReportProgress: function (percentage, player) {
        var that = this;
        var percentage = Math.round((player.currentTime() / player.duration()) * 100);
        if (percentage > 0 && percentage <= 100) {
            if (percentage > 25 && percentage < 50 && !player.ga_25) {
                var data = {
                    'playerType': 'videojs',
                    'percentageSeen': 'Quartiles 25%',
                    'player' : player,
                    'duration' : player.duration(),
                    'currentTime' : player.currentTime()
                };
                var pushed = that.options.eventsCallback('progress',data );
                that.video_tracking_events('progress',data)
                player.ga_25 = true;
            } else if (percentage > 50 && percentage < 75 && !player.ga_50) {
                var data = {
                    'playerType': 'videojs',
                    'percentageSeen': 'Quartiles 50%', 
                    'player' : player,
                    'duration' : player.duration(),
                    'currentTime' : player.currentTime() 
                };
                var pushed = that.options.eventsCallback('progress',data );
                that.video_tracking_events('progress',data)
                player.ga_50 = true;
            } else if (percentage > 75 && percentage < 100 && !player.ga_75) {
                var data = {
                    'playerType': 'videojs',
                    'percentageSeen': 'Quartiles 75%',
                    'player' : player,
                    'duration' : player.duration(),
                    'currentTime' : player.currentTime()
                } ;
                var pushed = that.options.eventsCallback('progress', data);
                that.video_tracking_events('progress',data)
                player.ga_75 = true;

            }  else if (percentage == 100 && !player.ga_100) {
                //that.LoadRecommendations(player);
                var data =  {
                    'playerType': 'videojs',
                    'percentageSeen': 'Quartiles 100%',
                    'player' : player,
                    'duration' : player.duration(),
                    'currentTime' : player.currentTime(),
                    'ended' : true
                };
                var pushed = that.options.eventsCallback('progress',data);
                that.video_tracking_events('progress',data)
                that.options.eventsCallback('ended',data );
                player.ga_100 = true;
                clearTimeout(player.progressTimer);
                document.getElementById(player.id()).setAttribute('video_status','ended');
                that.pageRefreshEnableDisable('pageRefreshEnable');
                if (that.nextVideo) {
                var nextVideElm = document.getElementById(player.id()).parentElement.getElementsByClassName("next-video-wrap")[0]
                setTimeout(function() {
                    nextVideElm.style.display="block";
                    nextVideElm.style.position="absolute";
                    nextVideElm.style.top= '0' ;
                    window['siema_' + player.id()]  = new  Siema({
                        selector: '.siema.'+player.id(),
                        startIndex: 0.77,
                        perPage: 1.4,
                        onChange: function(){
                            console.log(crrntSlide)
                            crrntSlide =    Math.round(this.currentSlide) 
                            this.sliderFrame.offsetParent.firstElementChild.lastElementChild.innerText =this.innerElements[Math.ceil(crrntSlide)].firstElementChild.innerText;
                           
                        },
                        onInit: function(){
                            crrntSlide =    Math.round(this.currentSlide) 
                            this.sliderFrame.offsetParent.firstElementChild.lastElementChild.innerText =this.innerElements[crrntSlide].firstElementChild.innerText;
                            slctrStr = '.siema' + '.' + player.id()
                            document.querySelector(slctrStr).offsetParent.querySelector('.next').addEventListener('click',function(){
                                window['siema_' + player.id()].next()
                            })
                            document.querySelector(slctrStr).offsetParent.querySelector('.prev').addEventListener('click',function(){
                                window['siema_' + player.id()].prev()
                            }) 
                          
                        
                        }
                    })

                  }, 3000,nextVideElm);
                }
          }
        
        }
    },
    
    pageRefreshEnableDisable: function(Tgglkey){
        if (typeof(window[Tgglkey])=='function'){
            window[Tgglkey]();
        };
    },
    URLToArray: function(url) {
        var request = {};
        var pairs = url.substring(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            if(!pairs[i])
                continue;
            var pair = pairs[i].split('=');
            request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
         }
         return request;
    },
    ArrayToURL: function(array) {
        var pairs = [];
        for (var key in array)
            if (array.hasOwnProperty(key))

            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(array[key]));
        return pairs.join('&');
    },
    BuildYoutubeContainer: function(options) {
        var playerID = "player_" + options.container.attributes[this.options.containerAttrPrefix].value;
        options.container.classList.add('youtube-wrapper-iframe');
        options.container.classList.add('video-wrap');
        options.container.classList.add('video-wrap2');
        var playerWrapper = document.createElement("div");
        playerWrapper.id = playerID;
        playerWrapper.classList.add('video');
        playerWrapper.classList.add('youtube-iframe');
        var playeLoader = document.createElement("div");
        playeLoader.classList.add('loader');
        playerWrapper.appendChild(playeLoader);
        options.container.appendChild(playerWrapper);
        //options.container.appendChild(this.GenerateNextVideo(options));
        options.container.appendChild(this.GenerateFooter(options));
        var autoplayVal = '0' ;
        autoplayVal = this.options.autoplay ? true  : this.atf(options);


        var iu = "";
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]iu=([^&#]*)');
        var results = regex.exec(this.adTagUrl);
        if(results && results.length > 0){
            iu = results[1];
        }
        
        var cust_params = "";
        var regex = new RegExp('[\\?&]cust_params=([^&#]*)');
        results = regex.exec(this.adTagUrl);
        if(results && results.length > 0){
            cust_params = results[1];
            cust_params = this.URLToArray(decodeURIComponent(cust_params));
            cust_params['player'] = 'pfp';
            cust_params = encodeURIComponent(this.ArrayToURL(cust_params));
        }

        var video_block = {
            id: playerWrapper.id,
            height: '240',
            width: '100%',
            videoId: options.data.youtube_id,
            FlpATfPrcntg: '-1',
            autoplay: autoplayVal,
            playerVars: {

            },
            embedConfig: {
                autonavRelatedVideos: true,
                adsConfig: {
                    adTagParameters: {
                        iu: iu,
                        cust_params:cust_params, 
                    },
                    nonPersonalizedAd: false
                  }
            },
            events: {
                'onStateChange': YnetYoutube.onPlayerStateChange,
                'onReady': YnetYoutube.onPlayerReady
            }
        };
        window.YnetYoutube.playerInfoList.push(video_block);
        this.video_tracking(options,'Youtube')
        if (this.debug_mode) {
            this.cnslt(this.options.adTagUrl,options)
        }
        return this;
    },
    BuildFallbackContainer: function(options) {
        
        this.fallbackPlayer = true;
        options.container.classList.add('video-wrap');
        options.container.classList.add('video-wrap2');
        options.container.setAttribute('fallback-player', options.container.attributes[this.options.containerAttrPrefix].value);
        if (options.container.attributes[this.options.containerAttrPrefix].value == 'live'  || options.container.attributes[this.options.containerAttrPrefix].value == 'external') {
            options.container.setAttribute('fallback-player', options.data.id);   
        }
        if(!this.players[options.container.getAttribute('fallback-player')]) {
            this.players[options.container.getAttribute('fallback-player')] = options;
        }
        var playerWrapper = document.createElement("video");
        playerWrapper.id = "player_" + options.container.attributes[this.options.containerAttrPrefix].value;
        if (options.container.attributes[this.options.containerAttrPrefix].value == 'live' || options.container.attributes[this.options.containerAttrPrefix].value == 'external') {
            playerWrapper.id =  "player_" + options.data.id ;
        }
        playerWrapper.classList.add('video-js');
        if (options.data.poster_image ) playerWrapper.setAttribute('poster',options.data.poster_image);
        if (options.container.attributes.poster) {
            playerWrapper.setAttribute('poster',options.container.attributes.poster.value);
        }
        playerWrapper.classList.add('video');
        playerWrapper.classList.add('vjs-16-9');
        options.container.setAttribute('at-play',(this.options.autoplay ? true : this.atf(options) ? true : false ) )
        playerWrapper.style.marginBottom = '7px';
        playerWrapper.setAttribute('controls', '');
        //playerWrapper.setAttribute('preload', 'auto');
        playerWrapper.setAttribute('playsinline', '');
        playerWrapper.setAttribute('width', '100%');
        var playerSource = document.createElement("source");
        playerSource.setAttribute('type', this.ContentType(options.data.desktop.split(".").pop()));
        playerSource.src = options.data.desktop;
        playerWrapper.appendChild(playerSource);
        options.container.appendChild(playerWrapper);
        if (typeof options.realtedVideos.length == "number" && options.realtedVideos.length > 0 ) options.container.appendChild(this.GenerateNextVideo(options,playerWrapper.id));
        options.container.appendChild(this.GenerateFooter(options));
        this.video_tracking(options,'VideoJS')
    },
    GenerateFooter: function(options) {
       var that =this ;
        var playerFooter = document.createElement("div");
        playerFooter.classList.add('youtube-footer');
        playerFooter.classList.add('youtube-footerv2');
        var footerCredit = document.createElement("div");
        footerCredit.classList.add('youtube-credit')
        footerCredit.innerHTML = footerOverwrite = options.data.title;
        if (options.container.attributes.title) {
            footerOverwrite = options.container.attributes.title.value;
        }
        if (options.data.credits) {
            footerOverwrite += " (" + options.data.credits.valueOf() + ")";
        }
        footerCredit.innerHTML = footerOverwrite;
        var fbShare = document.createElement("img");
        fbShare.id="fbShare";
        fbShare.src = "https://www.ynet.co.il/Common/Api/Scripts/youtube/facebook-s.png";
        fbShare.setAttribute('alt','share-icon');
        fbShare.classList.add('share-image');
        fbShare.onclick = function() {
            window.open(that.buildUtmSharebleLink('https://www.facebook.com/sharer/sharer.php?u=' + escape(document.URL) ,'Facebook') + '&t=' + document.title,
                '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
                that.gaOnClickfunction('Facebook');
                return false;
        }
        var twShare = document.createElement("img");
        twShare.id="twShare";
        twShare.src = "https://www.ynet.co.il/Common/Api/Scripts/youtube/twitter-s.png";
        twShare.setAttribute('alt','share-icon');
        twShare.classList.add('share-image');
        twShare.onclick = function() {
        var llinkutm = that.buildUtmSharebleLink('www.placeholder.com?' , 'twitter')
        llinkutm = llinkutm.split('www.placeholder.com?')[1] ;
        window.open("https://twitter.com/share?url=" + escape(document.URL) + "&text=" + encodeURIComponent(document.title)  + escape(llinkutm) ,
                '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,heigsht=300,width=600');
                that.gaOnClickfunction('Twitter');
                return false;
        }
        if(this.IfMobile()){
            var whShare = document.createElement("img");
            whShare.id="whShare"
            whShare.src = "https://www.ynet.co.il/Common/Api/Scripts/youtube/whatsapp-s.png";
            whShare.setAttribute('alt','share-icon');
            whShare.classList.add('share-image');
            whShare.setAttribute('data-action',"share/whatsapp/share");
            
            whShare.onclick = function() {
                window.open("whatsapp://send?text=" + escape(document.URL) + "&text=" + document.title,
                    '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,heigsht=300,width=600');
                return false;
            }
        }
        if(this.options.siteName=='calcalist' || this.options.siteName=='ctech' ){
        var lnkdnShare = document.createElement("a");
        lnkdnShare.id="lnkdnShare";
        lnkdnShare.href = "https://www.linkedin.com/shareArticle?url=" + escape(document.URL) + "&title=" + document.title
        lnkdnShare.target = "_blank"
        lnkdnShare.style.backgroundImage = "url('https://player.h-cdn.com/svc/cdn/pub/img/share_btn_linkedin.svg')";
        lnkdnShare.style.width='32px'
        lnkdnShare.classList.add('share-image');
        var mlShare = document.createElement("a");
        mlShare.id="mlShare";
        mlShare.style.backgroundImage = "url('https://player.h-cdn.com/svc/cdn/pub/img/share_btn_email.svg')"
        mlShare.classList.add('share-image');
        mlShare.href ="mailto:?body=" + escape(document.URL) + "&subject=" + document.title  
        mlShare.style.width='32px'     
        footerCredit.style.width = '68%';
        }

        playerFooter.appendChild(footerCredit);
        playerFooter.appendChild(fbShare);
        playerFooter.appendChild(twShare);
        if(this.IfMobile()){
            playerFooter.appendChild(whShare);
            footerCredit.style.width = '68%';
        }
        if(this.options.siteName=='calcalist' || this.options.siteName=='ctech' ){
            playerFooter.appendChild(lnkdnShare);
            playerFooter.appendChild(mlShare);
        }
        
        return playerFooter;
    },
    GenerateNextVideo: function(options,playerId) {
        var that = this;
        var siemaCrsl = document.createElement("div")
        siemaCrsl.setAttribute('style',"display:none;width:100%;background-color: #000000")
        siemaCrsl.classList.add('next-video-wrap');
        var headLine = document.createElement("div");
        headLine.setAttribute('style',"width:100%;height:83px;")
        YitVideo.logobrand(headLine,that.options.icon)
        headLine.firstChild.firstChild.style.top= "20px";
        headLine.firstChild.firstChild.style.right= "20px";
        
        var rePlay = document.createElement("img");
        rePlay.src = "/images/video/replay.png";
        rePlay.setAttribute('style',"position: absolute;left: 0;margin: 22px;")
        rePlay.addEventListener("click", function(){
            siemaCrsl.style.display='none';
        });
        headLine.appendChild(rePlay)
        
        var headLineTxt =  document.createElement("small");
        headLineTxt.setAttribute('style',"text-overflow: ellipsis;overflow: hidden;width: 258px;height: 17px;font-family: Arial;font-size: 16px;position:absolute;top:20px;text-align: right;top: 33px;margin-right: 78px;color: white")
        headLine.appendChild(headLineTxt)

        siemaCrsl.appendChild(headLine)

        var prevBtn = document.createElement("div")
        prevBtn.setAttribute('style',"background-Image:url(/images/video/siema_left.png); ;  width: 40px;height: 40px;position: absolute;top: 166px;z-index: 1;left:5px;border-radius: 50%;cursor:pointer;")
        prevBtn.classList.add('prev')
        var nextBtn = document.createElement("div")
        nextBtn.setAttribute('style',"background-Image:url(/images/video/siema_right.png);  width: 40px;height: 40px;position: absolute;top: 166px;z-index: 1;border-radius: 50%;right:5px;cursor:pointer;")
        nextBtn.classList.add('next')
        
        siemaCrsl.appendChild(headLine)
        siemaCrsl.appendChild(prevBtn)
        siemaCrsl.appendChild(nextBtn)

        var NextVideo = document.createElement("div");
        //NextVideo.classList.add('next-video-wrap');
        NextVideo.classList.add('siema');
        NextVideo.classList.add(playerId);
        NextVideo.setAttribute('style',"width:100%;background-color: #000000")

        for (i = 0; i < options.realtedVideos.length; i++) {
            var relatedVideo = document.createElement("div");
            relatedVideo.setAttribute('next-id',options.realtedVideos[i].id);
            //relatedVideo.classList.add('related-video');
            relatedVideo.style.backgroundImage = "url("+options.realtedVideos[i].poster_image+")";
            relatedVideo.style.height = '193px';
            relatedVideo.style.backgroundSize="cover"
            
            var text = document.createElement("small");
            //text.classList.add('related-video-title');
            text.setAttribute('style',"height: 45px;font-size: 20px;line-height: 1.15;text-align: right;color:white;margin: 0 15px 0 15px;position: relative;top: 20px;")
            text.innerHTML = options.realtedVideos[i].title;
            relatedVideo.appendChild(text);

            var play = document.createElement("img");
            play.classList.add('related-video-play');
            play.src = "/images/video/play-sm.png";
            relatedVideo.appendChild(play);

            
            relatedVideo.onclick = function (){
                options.container.setAttribute('yitvideo',this.getAttribute('next-id'));
                options.container.setAttribute('fallback-player',this.getAttribute('next-id'));
                options.container.setAttribute('initialized',"false");
                
                that.InfrastructureReInitialize();
            }
            
            NextVideo.appendChild(relatedVideo);
            siemaCrsl.appendChild(NextVideo)
        }
        return siemaCrsl;
    },
    InfrastructureReInitialize:function(){
        var that = this;
        new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(1)
            }, 500);
        }).then(function() {
            return that.InfrastructureInitialize();
        }).then(function() {
            setTimeout(function() { 
                that.InitPlayers()
            }, 1000);
        })

    },
    LoadRecommendations: function(player_tmp){
        if(!player_tmp.recommendations_loaded) {
            player_tmp.hide();
            $("#"+player_tmp.id()).next().show();
            player_tmp.recommendations_loaded = true;
        }
    },
    FloatingPlayer: function(currentFloatingPlayer) {
        var $window = $(window);
        $videoWrap = currentFloatingPlayer.playerWrap;
        var windowScrollTop = $window.scrollTop();
        var videoHeight = currentFloatingPlayer.videoHeight;
        var videoBottom = currentFloatingPlayer.videoBottom;

        if ( windowScrollTop > videoBottom && $($videoWrap).find('.video').attr('video_status').includes('play')) {} 
        else{
            $($videoWrap).height('').width('');
            $($videoWrap).removeClass('stuck');
            YitVideo.currentFloatingPlayer = {playerWrap : null,status: false}
        }

    },
    FloatingOnScroll: function() {
        if(screen.width > 1280) {
            var currentFloating = false;
            var $window = $(window);
            $window.on('scroll',  function() {
                if(YitVideo.currentFloatingPlayer.status){
                    YitVideo.FloatingPlayer(YitVideo.currentFloatingPlayer);
                } else {
                    $('.video-wrap').each(function( index ) {
                            var $videoWrap = this;
                            var windowScrollTop = $window.scrollTop();
                            var videoHeight = $($videoWrap).outerHeight();
                            var videoBottom = videoHeight + $($videoWrap).offset().top;
                            if ( windowScrollTop > videoBottom && $($videoWrap) && $($videoWrap).find('.video')
                            && $($videoWrap).find('.video').attr('video_status')
                            && $($videoWrap).find('.video').attr('video_status').includes('play')) {
                                    YitVideo.currentFloatingPlayer = {
                                        playerWrap : $($videoWrap),
                                        status: true,
                                        videoBottom:videoBottom,
                                        videoHeight : videoHeight
                                    }
                                    $($videoWrap).height(videoHeight).width(350);
                                    $($videoWrap).addClass('stuck');
                            }
                    });
                }
            });
        }
    },
    atf :function(options) {
        try { 
        if(Object.keys(YitVideo.players).length > 1) {
            return false ;
        }
            ref=false;						
		if(window.top.document.referrer != "" && parent.performance.navigation.type != parent.PerformanceNavigation.TYPE_RELOAD){
										ref = new URL(window.top.document.referrer).origin
		}
        iframeEl = options.container;
        AtforBtf = ( window.parent.innerHeight >  iframeEl.offsetTop  )  ? "ATF_"  : "BTF_" ;
        rfrr =   ref   ? ( ref == window.location.origin   && window.top.location.href.search("#autoplay") > 0  )  ? true : false : false ;
        intent = rfrr ?  ( AtforBtf == "ATF_"  )  ?  "intent" : false : false ; 
        autoplay =   rfrr ?  ( AtforBtf == "ATF_"  )  ?  true  : false : false  ;
            if(!ref){
                autoplay = false;  
            }
            var adtagMap = { 
                intent: intent ,
                AtforBtf : AtforBtf,
                autoplay : autoplay
            }
      this.adtagurlBuild(adtagMap)
       return autoplay;
        }
      catch(error){
          return false ;
      }
    },
      adtagurlBuild: function(adtagMap){
      var tmpadTagUrl = ""  ;
      var AdtagStrnObj = { 'autoplay':adtagMap.intent,
                           'VideoPosition_autoplay': 'Preroll_' + adtagMap.intent ,
                           'PositionInPage_Autoplay' : adtagMap.AtforBtf + adtagMap.intent ,
                            'user_intent' : intent
                        }

      for(var propt in AdtagStrnObj){
        var strT = '&'+ propt + '=' + AdtagStrnObj[propt] ;
        tmpadTagUrl = tmpadTagUrl +strT ; 
       }  
       this.options.adTagUrl = this.adTagUrl + encodeURIComponent(tmpadTagUrl) ;
       try {
          var permutiv = localStorage.getItem('_psegs');
          if(permutiv){
              this.options.adTagUrl = this.adTagUrl.replace('cust_params=',`cust_params=permutive%3D${encodeURIComponent(permutiv.replace('[','').replace(']',''))}%26`);
          }
      }catch(e){}
    },
    InfrastructureInitialize: function() {
        this.containersNodes = document.querySelectorAll("[" + this.options.containerAttrPrefix + "]");
        var that = this;
        [].forEach.call(that.containersNodes, function(container) {
            if(container.hasAttribute('initialized') && container.getAttribute("initialized") == "true"){
                return true;
            }
            


            container.innerHTML = "";
            var AttrPrefixId =  container.attributes[that.options.containerAttrPrefix].value.toLowerCase()
            if(AttrPrefixId == 'live' || AttrPrefixId == 'external' ){
                var video_id = new Date().getUTCMilliseconds();
				if(typeof container.attributes["externalid"] != "undefined" && container.attributes["externalid"].value ){
					 var video_id = container.attributes["externalid"].value;
				} else if(typeof container.attributes["data-externalid"] != "undefined" && container.attributes["data-externalid"].value ) {
					 var video_id = container.attributes["data-externalid"].value;
				} else {
					  var video_id = AttrPrefixId + '_'+ new Date().getUTCMilliseconds();
				}
                
                
                that.BuildFallbackContainer({
                    container: container,
                    data: {
                        "title": typeof container.attributes["title"] != "undefined" ? container.attributes["title"].value : container.attributes["data-title"].value,
                        "desktop": typeof container.attributes["stream"] != "undefined"  ? container.attributes["stream"].value : container.attributes["data-stream"].value,
                        "ads":  typeof container.attributes["ads"]  != "undefined"  ? container.attributes["ads"].value : container.attributes["data-ads"].value,
                        "status": null,
                        "youtube_id": null,
                        "sub_title": null,
                        "related": [],
                        "mobile": null,
                        "category_id": 0,
                        "id": video_id,
                        "credits": null
                    },
                    realtedVideos : []
                });
                container.setAttribute('initialized','');
                container.setAttribute('player-type','videosjs');
                return true;
            }
            
            that.AjaxAsync({
                    url: that.gvideoApi(
                        {
                          "videoid":container.attributes[that.options.containerAttrPrefix].value,
                          "articleidcontainer":container.attributes['article_id'] 
                        }
                    ),
                    method: "GET"
                }).then(function(data) {
                    var videoData = data[0];
                    if(!videoData.related || ( !(typeof videoData.related  === undefined)  && videoData.related.length < 3  ) || !that.nextVideo ){
                        videoData.related = [];
                    } else {
                        that.LoadScriptAsync(YitVideo.externalResources.videojssiemamin)
                    }

                    if (videoData.youtube_id != null && that.options.dynamicPlayerType == true && videoData.status == 1) {
                        that.BuildYoutubeContainer({
                            container: container,
                            data: videoData ,
                            realtedVideos : videoData.related
                        });
                        container.setAttribute('initialized','true');
                        container.setAttribute('player-type','youtube');
                    } else {
                        that.BuildFallbackContainer({
                            container: container,
                            data: videoData,
                            realtedVideos : videoData.related
                        });
                        container.setAttribute('initialized','');
                        container.setAttribute('player-type','videosjs');
                    }
                })
        });
        return this;
    },

    logobrand : function(plr,icn) {
        var player = plr;
        var link = document.createElement("a");
            link.id = "";
            link.href = "javascript:void(0);" 
        var image = document.createElement('img');
            image.id= 'siteLogo';
            image.classList.add("vjs-logobrand-image");
            image.style.position = "absolute";
            image.style.top = "4px";
            image.style.right = "4px";
            image.src = icn ? icn : YitVideo.logo ;
            if(image.src.includes("favicon_1.ico")) { 
              image.width = "40";
            }
            if(image.src.includes("ynetlvestylogo.png")) {
                image.style.right = "unset";
                image.style.left = "4px";
            }
            link.appendChild(image);
            player.appendChild(link);
        
    },

    video_tracking : function(options,plrTyp) {
        var  optionsData = options.data;
        options.data.AnltmetaData = {
                            'playerType': plrTyp,
                            'embedUrl': '',
                            'videoLength': '',
                            'videoTitle': optionsData.title,
                            'videoID': optionsData.id,
                            'liveBroadcast': (options.container.attributes[this.options.containerAttrPrefix].value.toLowerCase() == 'live' ? 'Yes' : 'No'),
                            'videoChannel': (options.container.attributes.externalChannel ? options.container.attributes.externalChannel.value : 'ynet')
                            };
    },


    cnslt :function(adTag,options) {

        console.log( '%c%s',
        'color: green;  font-size: 16px;', "VIDEOJS - INITIALIZED"  ,{
        id: ( (typeof options.data == 'undefined' || typeof options.data.youtube_id == 'undefined') ? options.id : options.data.youtube_id),
        adtag:adTag,
        custparams:YitVideo.URLToArray(decodeURIComponent(adTag))
        })
    },


    
    addOrReplaceParam :function (url, param, value) {
        param = encodeURIComponent(param);
        var r = "([&?]|&amp;)" + param + "\\b(?:=(?:[^&#]*))*";
        var a = document.createElement('a');
        var regex = new RegExp(r);
        var str = param + (value ? "=" + encodeURIComponent(value) : "");
        a.href = url;
        var q = a.search.replace(regex, "$1" + str);
        if (q === a.search) {
            a.search += (a.search ? "&" : "") + str;
        } else {
            a.search = q;
        }
        return a.href;
    },


    buildUtmSharebleLink :function(share_link,shareType) {
      var utm_medium = 'social';
      share_link = this.addOrReplaceParam(share_link,'utm_source',window.top.location.hostname.replace('www.','').replace('qa.',''));
      share_link = this.addOrReplaceParam(share_link,'utm_medium',utm_medium);
      share_link = this.addOrReplaceParam(share_link,'utm_campaign',shareType);
      if(share_link.includes('/articles/')){
        try{
          const article_id = document.URL.split(',')[2].replace('L-','');
          share_link = this.addOrReplaceParam(share_link,'utm_term',article_id);
        }catch(e){console.log(e)}
      }
      return share_link;
    },

    gaOnClickfunction :function(shareType){
          const initialEvent = {
              event: 'share_events',
              Category : 'Social',
              Action :  'Share From Video ',
              Label : shareType
          };
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push(initialEvent);
    }




};


