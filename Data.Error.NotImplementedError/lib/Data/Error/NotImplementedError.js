//@esmodpp
//@version 0.1.2

//@require Data.Error
//@namespace Data.Error


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
    if ( this.hasOwnProperty("message") || !this.method ) {
        return Error.prototype.toString.call(this);
    }
    else {
        var e = new NotImplementedError();
        for ( var i in this ) e[i] = this[i];
        e.message = "an required method `" + this.method + "' has not been implemented.";
        return e.toString();
    }
};
