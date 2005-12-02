//@esmodpp

//@require data.error.TypeError
//@with-namespace data.error


Object.prototype.SUPER = function ( ctor ) {
    if ( !arguments.length ) ctor = this.constructor;
    if ( typeof ctor != "function" ) throw new TypeError("`" + ctor + "' is not a function.");
    var me = this;
    var s = ctor.prototype.constructor.prototype;
    var o = {};
    for ( var i in s ) {
        if ( typeof s[i] == "function" ) {
            o[i] = function ( method ) {
                return function(){ return s[method].apply(me, arguments) };
            }(i);
        }
    }
    return o;
}


Object.prototype.Super = function ( ctor ) {
    if ( !arguments.length ) ctor = this.constructor;
    if ( typeof ctor != "function" ) throw new TypeError("`" + ctor + "' is not a function.");
    var me = this;
    var s = ctor.prototype.constructor.prototype;
    return function ( method ) {
        if ( typeof s[method] != "function" ) throw new TypeError("SUPER." + method + " is not a function.");
        return function(){ return s[method].apply(me, arguments) }
    };
}

