//@esmodpp
//@version 0.1.2

//@require Data.Error
//@namespace Data.Error


//@export NotSupportedError
var NotSupportedError = newErrorClass(
    NAMESPACE + ".NotSupportedError",
    function ( message, method ) {
        this.method = method;
    }
);

var proto = NotSupportedError.prototype;

proto.message = "an optional method is not supported.";

proto.toString = function ( ) {
    if ( this.hasOwnProperty("message") || !this.method ) {
        return Error.prototype.toString.call(this);
    }
    else {
        var e = new NotSupportedError();
        for ( var i in this ) e[i] = this[i];
        e.message = "an optional method `" + this.method + "' is not supported.";
        return e.toString();
    }
};

