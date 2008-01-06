//@esmodpp
//@namespace WebBrowser
//@version 0.0.0

//@require JSON
//@with-namespace JSON



var DEFAULT_OPTS = {
    document: document,
    path    : void 0,
    domain  : void 0,
    secure  : false,
    expires : null,
    duration: void 0
};

//@export Cookie
function Cookie ( name, opts ) {
    this.name(name);
    opts = opts || {};
    this.document( opts.hasOwnProperty("document") ? opts.document : DEFAULT_OPTS.document );
    this.path(     opts.hasOwnProperty("path")     ? opts.path     : DEFAULT_OPTS.path     );
    this.domain(   opts.hasOwnProperty("domain")   ? opts.domain   : DEFAULT_OPTS.domain   );
    this.secure(   opts.hasOwnProperty("secure")   ? opts.secure   : DEFAULT_OPTS.secure   );
    if ( opts.hasOwnProperty("expires") ) {
        if ( opts.hasOwnProperty("duration") ) {
            throw new Error("duration and expires option cannot be used together");
        }
        this.expires(opts.expires);
    } else if ( opts.hasOwnProperty("duration") ) {
        this.duration(opts.duration);
    } else {
        this.expires(DEFAULT_OPTS.expires);
    }
}


var proto = Cookie.prototype;

proto.name = function ( n ) {
    if ( arguments.length >= 1 ) {
        n = String(n);
        if( !n.match(/^\w+$/) ) throw new Error("cookie name must match /^\w+$/");
        this._name = n;
    }
    return this._name;
};

proto.document = function ( d ) {
    if ( arguments.length >= 1 ) {
        if ( typeof d.cookie == "string" ) {
            this._document = d;
        } else {
            throw new TypeError("document option must be document-node");
        }
    }
    return this._document;
};

proto.path = function ( p ) {
    if ( arguments.length >= 1 ) {
        this._path = p == null ? null : String(p);
    }
    return this._path;
};

proto.domain = function ( d ) {
    if ( arguments.length >= 1 ) {
        this._domain = d == null ? null : String(d);
    }
    return this._domain;
};

proto.secure = function ( s ) {
    if ( arguments.length >= 1 ) {
        this._secure = Boolean(s);
    }
    return this._secure;
};

proto.expires = function ( d ) {
    if ( arguments.length >= 1 ) {
        if ( d == null ) {
            this._expires = null;
        } else {
            if ( !(d instanceof Date) ) {
                if ( typeof d != "number" ) {
                    d = Date.parse(d);
                    if ( isNaN(d) ) {
                        throw new Error("can't convert argument into Date object: " + d);
                    }
                }
                d = new Date(d);
            }
            this._expires = d;
        }
        this._duration = null;
    }
    return this._expires;
};

proto.duration = function ( s ) {
    if ( arguments.length >= 1 ) {
        if ( s == null ) {
            this._duration = null;
        } else {
            s = String(s).toLowerCase();
            var result = {
                year : 0,
                month: 0,
                date : 0,
                hour : 0,
                min  : 0,
                sec  : 0
            };
            var re = /(\d+)(m[io]?|[ydhs])/g;
            var match;
            while ( match = re.exec(s) ) {
                switch ( match[2] ) {
                  case "y":
                    result.year = Number(match[1]);
                    break;
                  case "mo":
                    result.month = Number(match[1]);
                    break;
                  case "d":
                    result.date = Number(match[1]);
                    break;
                  case "h":
                    result.hour = Number(match[1]);
                    break;
                  case "mi":
                  case "m" :
                    result.min = Number(match[1]);
                    break;
                  case "s":
                    result.sec = Number(match[1]);
                    break;
                }
            }
            this._duration = result;
        }
        this._expires  = null;
    }
    if ( this._duration ) {
        var buf = [];
        if ( this._duration.year  ) buf.push(this._duration.year  + "y");
        if ( this._duration.month ) buf.push(this._duration.month + "mo");
        if ( this._duration.date  ) buf.push(this._duration.date  + "d");
        if ( this._duration.hour  ) buf.push(this._duration.hour  + "h");
        if ( this._duration.min   ) buf.push(this._duration.min   + "m");
        if ( this._duration.sec   ) buf.push(this._duration.sec   + "s");
        return buf.join(" ");
    } else {
        return null;
    }
};

proto.load = function ( ) {
    var r = this._document.cookie.match(new RegExp(this._name + "=([^;]*)"));
    return r ?  eval("("+decodeURIComponent(r[1])+")") : void 0;
};

proto.store = function ( v ) {
    this._document.cookie = make_cookie.call(this, v);
};

proto.remove = function ( ) {
    var expires  = this._expires;
    var duration = this._duration;
    try {
        this._expires = new Date(0);
        this.store(0);
    } finally {
        this._expires  = expires;
        this._duration = duration;
    }
};

proto.toString       =
proto.toLocaleString = function ( ) {
    return make_cookie.call(this, this.load());
};

function make_cookie ( v ) {
    var cookie = this._name + '=' + encodeURIComponent(dump(v));
    var expires = null;
    if ( this._expires ) {
        expires = this._expires;
    } else if ( this._duration ) {
        var d = new Date();
        d.setFullYear(d.getFullYear() + this._duration.year,
                      d.getMonth()    + this._duration.month,
                      d.getDate()     + this._duration.date );
        d.setHours(d.getHours()   + this._duration.hour,
                   d.getMinutes() + this._duration.min,
                   d.getSeconds() + this._duration.sec );
        expires = d;
    }
    if ( expires ) {
        cookie += '; expires=' + expires.toUTCString();
        var max_age = Math.floor((expires.valueOf() - (new Date).valueOf()) / 1000);
        if ( max_age < 0 ) max_age = 0;
        cookie += '; max-age=' + max_age;
    }
    if ( this._path   ) cookie += '; path=' + this._path;
    if ( this._domain ) cookie += '; domain=' + this._domain;
    if ( this._secure ) cookie += '; secure';
    return cookie;
}
