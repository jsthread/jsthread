//@esmodpp
//@require data.error
//@require oop.SUPER

//@namespace data.error

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
    if ( this.hasOwnProperty("message") ) {
        return this.Super(NotSupportedError)("toString")();
    }
    else if ( this.method ) {
        return (new NotImplementedError("an optional method `" + this.method + "' is not supported")).toString();
    }
    else {
        return this.Super(NotSupportedError)("toString")();
    }
};

