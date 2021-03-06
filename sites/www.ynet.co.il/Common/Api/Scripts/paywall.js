var YitPaywall = {
    userCookieName: "UGF5bWV",
    user: null,
    LoginPopUp: null,
    platform: 'desktop',
    LoginLink: null,
    userCookie: document.cookie.match(/^(.*;)?\s*UGF5bWV\s*=\s*[^;]+(.*)?$/),
	pianoscriptkey:'scyIGFmBpu',
    originWhiteList: [
        "www.ynet.co.il",
        "pplus.ynet.co.il",
        "m.pplus.ynet.co.il",
        "m.ynet.co.il",
        "stg2-m.ynet.co.il",
    ],
    iphone: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    routesConfig: {
        loginPopUp: null,
        registerPage: null,
        premiumArticleUrlsPattern: {
            'wcm': {
                'free': '/articles',
                'premium': '/articles/premium'
            },
            'desktop': {
                'free': '/articles',
                'premium': '/articles/premium'
            },
            'mobileweb': {
                'free': '/articles',
                'premium': '/articles/premium'
            },
            'mobilewebpplus': {
                'free': '/article.aspx',
                'premium': '/premium/article.aspx'
            },
            'iphone': {
                'free': '/Html',
                'premium': '/Html/premium'
            },
            'android': {
                'free': '/Html',
                'premium': '/Html/premium'
            },
        }
    },
    ApiRroutesConfig: {
        Origin: "https://premium.ynet.co.il",
        logout: "/Api/account/logout",
        login: "/web/login",
        register: "/web/register",
        refreshToken: "/Api/account/login/refresh"
    },
    Constructor: function() {

        window.addEventListener('message', function(message) {
            if (YitPaywall.ApiRroutesConfig.Origin == message.origin) {
                if (message.data) {
                    if (message.data.event) {
                        switch (message.data.event) {
                            case "close":
                                YitPaywall.closePopUpCallback();
                                break;
                            case "successLogin":
								if(typeof window.ynetPWA != "undefined" && window.ynetPWA){
									return false;
								}
                                if (YitPaywall.setUser()) {
                                    if(localStorage.getItem('redirect_to_plus_after_login')){
                                      localStorage.removeItem('redirect_to_plus_after_login');
                                      window.location.href = '/plus';
                                    } else {
                                      YitPaywall.redirectToPremiumArticle();
                                    }
                                }
                                break;
                            default:
                                return false;
                        }
                    }
                }
            }
        }, false);

        if (!String.prototype.includes) {
            String.prototype.includes = function(search, start) {
              if (typeof start !== 'number') {
                start = 0;
              }
        
              if (start + search.length > this.length) {
                return false;
              } else {
                return this.indexOf(search, start) !== -1;
              }
            };
        }

        if (!Array.prototype.includes) {
            Object.defineProperty(Array.prototype, "includes", {
                enumerable: false,
                writable: true,
                value: function(searchElement /*, fromIndex*/ ) {
                    'use strict';
                    var O = Object(this);
                    var len = parseInt(O.length) || 0;
                    if (len === 0) {
                        return false;
                    }
                    var n = parseInt(arguments[1]) || 0;
                    var k;
                    if (n >= 0) {
                        k = n;
                    } else {
                        k = len + n;
                        if (k < 0) {k = 0;}
                    }
                    var currentElement;
                    while (k < len) {
                        currentElement = O[k];
                        if (searchElement === currentElement ||
                            (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                                return true;
                            }
                            k++;
                        }
                        return false;
                    }
                });
        }

        String.prototype.url = function() {
            var a = document.createElement('a');
            a.setAttribute('href', this);
            var origin = a.protocol + '//' + a.hostname;
            if (a.port.length > 0) {
                origin = origin + ':' + a.port;
            }
            var res = {
                host : a.host,
                hostname : a.hostname,
                pathname : a.pathname,
                port : a.port,
                protocol : a.protocol,
                search : a.search,
                has : a.has,
            };
            return res;

        }

        if (this.getCookie(this.userCookieName) && this.getCookie(this.userCookieName).length > 0) {
            this.user = {
                props: JSON.parse(this.getCookie(this.userCookieName))
            };
            try{
                YnetArticle.Config({
                    yid: this.user.props.userId
                });
            }catch(e){

            }
        }

        this.iphoneAppNotSupportedNotice = "https://" + this.originWhiteList[0] + "/Common/paywall/download-store.html?a";
        this.nextUrlProps = {
            host: this.getQueryVariable("orig-host"),
            path: this.getQueryVariable("orig-url"),
            queryString: this.getQueryVariable("orig-query")
        };
        return this;
    },
    getPremiumArticleURL: function() {
        if(this.platform.toLowerCase() == 'wcm'){
            return YitPaywall.premiumPath;
        }
        if (window.location.href.toLowerCase().indexOf("article") !== -1 ) {
            var URL = window.location.href.replace('Article', 'article').replace(
                this.routesConfig.premiumArticleUrlsPattern[this.platform].free,
                this.routesConfig.premiumArticleUrlsPattern[this.platform].premium
            ).replace('paywall-popup-type=login', '');
            if (this.platform == 'mobileWeb') {
                URL = URL.toLowerCase();
            }
        } else {
            var URL = window.location.href;
        }
        return URL;
    },
    getUserName: function() {
        if (!this.user.props) {
            return "אורח\\ת";
        }
        return this.user.props.firstName;
    },
    setUserData: function() {
        this.user = {
            props: JSON.parse(this.getCookie(this.userCookieName))
        };
        return true;
    },
    setUser: function() {
            try {
                return this.setUserData();
            } catch (e) {
                return false;
            }
    },
    logoutUser: function() {
        try {
            $.ajax({
                url: YitPaywall.ApiRroutesConfig.Origin + YitPaywall.ApiRroutesConfig.logout+'?_=' + new Date().getTime(),
                type: 'DELETE',
                xhrFields: {
                    withCredentials: true
                 },
                crossDomain: true,
                success: function(result) {
                    setTimeout(function(){ window.location.href = document.querySelector("link[rel='canonical']").href; }, 1000);
                }
            });
        }
        catch(e){
            setTimeout(function(){ window.location.href = document.querySelector("link[rel='canonical']").href; }, 1000);
        }
    },
    redirectToCanonical: function() {
        newlink = document.createElement('a');
        newlink.setAttribute('href', document.querySelector("link[rel='canonical']").href);
        document.body.appendChild(newlink);
        newlink.click();
    },
    httpGet: function(theUrl, method, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open(method, theUrl, false);
        xmlHttp.withCredentials = true;
        if (callback) {
            xmlHttp.onload = function() {
                callback({
                    'status': xmlHttp.status,
                    'data': xmlHttp.response
                })
            };
        }
        xmlHttp.send(null);
    },
    deleteAndRefersh: function() {
        localStorage.removeItem('userProps');
        YitPaywall.user = null;
        location.reload(); 
    },
    refreshToken: function() {

            var now = new Date();
            now = now.getTime() - (now.getTimezoneOffset() * 60000)
            if (!(/bridge/.test(document.URL.toLowerCase())) && document.cookie.match(/^(.*;)?\s*UGF5bWV\s*=\s*[^;]+(.*)?$/) && YitPaywall.user && YitPaywall.user.props.refreshDateUnx < now) {
                YitPaywall.httpGet(YitPaywall.ApiRroutesConfig.Origin + YitPaywall.ApiRroutesConfig.refreshToken, 'PUT', function(response) {
                    if (response) {
                        if (response.status == 200) {
                            var userData = JSON.parse(response.data);
                            if (userData.status > 0) {
                                YitPaywall.deleteAndRefersh();
                            } else {
                                YitPaywall.setUser();
                            }
                        } else {
                            YitPaywall.deleteAndRefersh();
                        }
                    } else {
                        YitPaywall.deleteAndRefersh();
                    }
                    return true;
                });
            }
            return true;
    },
    getQueryVariable: function(variable) {
    
    try{
  		if(variable == 'orig-url'){
  			return location.search.split('?')[1].split('=')[1];
  		}
  		if(variable == 'orig-query'){
  			return '?' + location.search.split('orig-query=')[1];
  		}
    }catch(e){}
        param = location.search.substring(1).split("&")
            .map(function(p) {
                return p.split("=")
            })
            .filter(function(p) {
                return p[0] == variable
            })
            .map(function(p) {
                return decodeURIComponent(p[1])
            })
            .pop();
        if(param == "/premium/Article.aspx?id"){param += "="+this.getQueryVariable('id')}
        return param;
    },
    nextPage: function() {
        
        if (this.nextUrlProps.host && this.nextUrlProps.path) {

            if(this.platform.toLowerCase() == 'wcm'){
                if(localStorage.getItem('wcmFreePath')) {
                    window.top.location.href = localStorage.getItem('wcmFreePath');
                } else {
                    window.top.location.href = 'https://' + this.originWhiteList[0];
                }
            }
            
            if (this.originWhiteList.includes(this.nextUrlProps.host)) {
                var URL = "https://" + this.nextUrlProps.host + this.nextUrlProps.path.replace('/premium', '') +
                    this.nextUrlProps.queryString;
                if(URL.endsWith('.html&orig-host?')){
                  URL = URL.replace('.html&orig-host?','.html');
                }
                if(URL.endsWith("&orig-host?")) {
                    URL = URL.replace('&orig-host?','');
                }
                window.top.location.href = URL;
            } else {
                window.top.location.href = 'https://' + this.originWhiteList[0];
            }
        }
    },
    addOrReplaceParam: function(url, param, value) {
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
    redirectToPremiumArticle: function() {
        if ((/article/.test(document.URL.toLowerCase())) && document.querySelector("meta[property='og:IsPay']") &&
            document.querySelector("meta[property='og:IsPay']").content == "1") {
            window.location.href = this.getPremiumArticleURL();
        } else {
            location.reload();
        }
    },
    userAutoRedirect: function() {
        var isCookie = document.cookie.match(/^(.*;)?\s*UGF5bWV\s*=\s*[^;]+(.*)?$/);
        if (isCookie) {
            var isAlreadyPremium = (/premium/.test(window.location.href.toLowerCase()));
            var onArticlePath = (/article/.test(window.location.href.toLowerCase()));
            var checkExist = setInterval(function() {
                if (document.querySelector("meta[property='og:IsPay']")) {
                    var isPremium = parseInt(document.querySelector("meta[property='og:IsPay']").content);
                    if (!isAlreadyPremium && onArticlePath && isPremium && isPremium > 0) {
                        window.location.href = YitPaywall.getPremiumArticleURL();
                    }
                    clearInterval(checkExist);
                }
            }, 100);
        }
    },
    getCookie: function(cname) {
        var name = cname + "=";
        var decodedCookie = this.DecodeEntities(decodeURIComponent(decodeURIComponent(document.cookie).replace(/\+/g, '%20')));
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    fixPplusPattern: function(){
        if(this.platform == 'mobilewebpplus' && !window.location.href.url().hostname.includes('pplus')){
            this.platform = 'mobileweb';
        }
    },
    DecodeEntities : function(str) {
        var element = document.createElement('div');
        if(str && typeof str === 'string') {
            str = escape(str).replace(/%26/g,'&').replace(/%23/g,'#').replace(/%3B/g,';');

            element.innerHTML = str;
            if(element.innerText){
                str = element.innerText;
                element.innerText = '';
            }else{
                str = element.textContent;
                element.textContent = '';
            }
        }
        return unescape(str);
    },
    openLoginPopUp: function(url, options) {
        
        if (this.iphone) {
            document.querySelector('html').classList.add('paywall-fix');
            document.querySelector('body').classList.add('paywall-fix');
        }
        
        if(options && options.redirect_to_plus) {
            localStorage.setItem('redirect_to_plus_after_login', true);
        }
        
        this.LoginLink = document.createElement('a');
        this.LoginLink.dataset.src = url || this.ApiRroutesConfig.Origin + this.ApiRroutesConfig.login;
        this.LoginLink.classList.add('iframe-lightbox-link');
        this.LoginLink.href = "javascript:void(0);";
        document.body.appendChild(this.LoginLink);
        [].forEach.call(document.getElementsByClassName("iframe-lightbox-link"), function(el) {
            el.lightbox = new IframeLightbox(el);
        });
        this.LoginLink.click();
        if (typeof dataLayer === 'undefined') {
            dataLayer.push({
                'event': 'GA_Event',
                'Category': 'ynet+',
                'Action': 'Login from HP',
                'Label': ''
            })
        }
        
    },
    Sleep: function(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
    },
    AsyncCallback: function(callbackBefore, callbackAfter) {
        callbackBefore();
        YitPaywall.Sleep(100);
        callbackAfter();
    },
    onPaywallLoad: function() {
        var refreshed = false;
        //refresh only for desktop & mobileweb
        if(YitPaywall.platform != 'iphone' && YitPaywall.platform != 'android'){
            refreshed = YitPaywall.refreshToken();
        } else {
            refreshed = true;
        }
        if(refreshed){
            //for bridg page redirect
            YitPaywall.nextPage();
            //for auto redirect for logged in users
            YitPaywall.userAutoRedirect();
        }
		
		try {
			var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
			if (!isMobile) {
			  this.pianoAdBlocekDtect();
			}
			  var scriptLoaded = this.LoadScriptAsync("//experience.tinypass.com/xbuilder/experience/load?aid="+this.pianoscriptkey );
				  scriptLoaded.then(function() {
					  YitPaywall.OnPianoHPLoad();
			  });
			
		}catch(e){console.log(e);}
		

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
    pianoAdBlocekDtect:function() {
        document.cookie = "__adblocker=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        var setNptTechAdblockerCookie = function(adblocker) {
            var d = new Date();
            d.setTime(d.getTime() + 60 * 5 * 1000);
            document.cookie = "__adblocker=" + (adblocker ? "true" : "false") + "; expires=" + d.toUTCString() + "; path=/";
        };
        var script = document.createElement("script");
        script.setAttribute("async", true);
        script.setAttribute("src", "//www.npttech.com/advertising.js");
        script.setAttribute("onerror", "setNptTechAdblockerCookie(true);");
        document.getElementsByTagName("head")[0].appendChild(script);    
    },
    OnPianoHPLoad: function() {
        try {
          if (document.querySelectorAll('script[type="application/ld+json"]')[0] && document.querySelectorAll('script[type="application/ld+json"]')[0].text) {
            var ContentSection = '' ;
            if(document.querySelector('meta[property="channel-name"]')) {
              ContentSection = document.querySelector('meta[property="channel-name"]').content;
            }
            if(ContentSection == '') {
                        try{
                              ContentSection = JSON.parse(document.querySelectorAll('script[type="application/ld+json"]')[1].text).breadcrumb.itemListElement[1].item.name ;
                          } catch(e){
                            try{
                                ContentSection = JSON.parse(document.querySelectorAll('script[type="application/ld+json"]')[1].text).breadcrumb.itemListElement[0].item.name;
                            } catch(e){
            
                            }
                          }
            } 

            var PianoHPdata = {
                setTags: window.dcTags ? window.dcTags : (document.querySelectorAll('script[type="application/ld+json"]')[0] && document.querySelectorAll('script[type="application/ld+json"]')[0].text ) ? JSON.parse(document.querySelectorAll('script[type="application/ld+json"]')[0].text).keywords : '' ,
                setContentCreated:(document.querySelectorAll('script[type="application/ld+json"]')[0] && document.querySelectorAll('script[type="application/ld+json"]')[0].text ) ?  JSON.parse(document.querySelectorAll('script[type="application/ld+json"]')[0].text).datePublished  : '' ,
                setContentAuthor:(document.querySelectorAll('script[type="application/ld+json"]')[0] && document.querySelectorAll('script[type="application/ld+json"]')[0].text ).author ? JSON.parse(document.querySelectorAll('script[type="application/ld+json"]')[0].text).author.name  : '',
                setContentSection:ContentSection,
                setContentIsNative:(window.article_type && window.article_type[0] && window.article_type[0].contentType) ? window.article_type[0].contentType :  (document.getElementsByClassName('art_marketing_credit_blue').length ?  'Sponsored' : 'Regular' ),
                setCustomVariable :( window.YitPaywall && window.YitPaywall.user && window.YitPaywall.user.props.userId ? 'Subscriber' : '') 
                } 
                Object.entries(PianoHPdata).forEach(function([key, value]) {
                    if(key == "setCustomVariable" ) {
                        tp.push([key, "userState", value]);
                    } else {
                        tp.push([key,value]);
                    } 
                 });  
            }

        } catch(e){console.log(e)} ;
    },
    InfrastructureInitialize: function() {
        if (typeof YitPaywallCallback == 'function') {
            YitPaywall.AsyncCallback(
                function() {
                    YitPaywallCallback();
                    YitPaywall.fixPplusPattern();
                },
                function() {
                    YitPaywall.onPaywallLoad();
                }
            );
        } else {
            YitPaywall.onPaywallLoad();
        }
    },
    closePopUpCallback: function() {
        if (document.getElementsByClassName('backdrop').length > 0) {
            document.getElementsByClassName('backdrop')[0].click();
        }
        if (this.iphone) {
            document.querySelector('html').classList.remove('paywall-fix');
            document.querySelector('body').classList.remove('paywall-fix');
        }
    }
};

YitPaywall.Constructor().InfrastructureInitialize();




