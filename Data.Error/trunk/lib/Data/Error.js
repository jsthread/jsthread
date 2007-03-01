//@esmodpp
//@use-namespace Data.Error
// We declare `Error' in this namespace, while we need to access 
// ECMAScript's native `Error' object.
// That's why we don't use @namespace here.


//@shared Error
Data.Error.Error = function ( message ) {
    if ( message !== undefined ) this.message = message;
    var e = Error.apply(this, arguments);
    for ( var i in e ) {
        if ( i=='name' || i=='message' ) continue;
        this[i] = e[i];
    }
};
var proto = Data.Error.Error.prototype = new Error();
proto.constructor = Data.Error.Error;
proto.name        = NAMESPACE + ".Error";
proto.message     = "something's wrong";
proto.toString = function ( ) {
    var s = String(this.message);
    return  s  ?  this.name + ": " + s
               :  this.name;
};

//@export newErrorClass
function newErrorClass ( name, init ) {
    var c = function ( ) {
        if ( typeof init == "function" ) var ret = init.apply(this, arguments);
        if ( ret !== false ) {
            if ( arguments[0] !== undefined ) this.message = arguments[0];
            var e = Error.apply(this, arguments);
            for ( var i in e ) {
                if ( this.hasOwnProperty(i) || i=='name' || i=='message' ) continue;
                this[i] = e[i];
            }
        }
    };
    var proto = c.prototype = new Data.Error.Error();
    proto.constructor = c;
    proto.name        = name;
    return c;
}


//@export Exception
function Exception ( message ) {
    if ( message !== undefined ) this.message = message;
    var e = Error.apply(this, arguments);
    for ( var i in e ) {
        if ( i=='name' || i=='message' ) continue;
        this[i] = e[i];
    }
}
var proto = Exception.prototype = new Error();
proto.constructor = Exception;
proto.name        = NAMESPACE + ".Exception";
proto.message     = "an exception has occurred.";
proto.toString = function ( ) {
    var s = String(this.message);
    return  s  ?  this.name + ": " + s
               :  this.name;
};

//@export newExceptionClass
function newExceptionClass ( name, init ) {
    var c = function ( ) {
        if ( typeof init == "function" ) var ret = init.apply(this, arguments);
        if ( ret !== false ) {
            if ( arguments[0] !== undefined ) this.message = arguments[0];
            var e = Error.apply(this, arguments);
            for ( var i in e ) {
                if ( this.hasOwnProperty(i) || i=='name' || i=='message' ) continue;
                this[i] = e[i];
            }
        }
    };
    var proto = c.prototype = new Exception();
    proto.constructor = c;
    proto.name        = name;
    return c;
}

