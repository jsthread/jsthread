//@esmodpp
//@version 0.1.1

//@require data.error
//@namespace data.error


//@export NotImplementedError
var NotImplementedError = newErrorClass(
    NAMESPACE + ".NotImplementedError",
    function ( message, method ) {
        this.method = method;
    }
);

var proto = NotImplementedError.prototype;

proto.message = "a required method has not been implemented.";

proto.toString = function ( ) {
    if ( this.hasOwnProperty("message") || !this.methd ) {
        return Error.prototype.toString.call(this);
    }
    else {
        var e = new NotImplementedError();
        for ( var i in this ) e[i] = this[i];
        e.message = "an optional method `" + this.method + "' is not supported";
        return e.toString();
    }
};
