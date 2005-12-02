//@esmodpp
//@require data.error
//@require oop.SUPER

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
    if ( this.hasOwnProperty("message") ) {
        return this.Super(NotImplementedError)("toString")();
    }
    else if ( this.method ) {
        return (new NotImplementedError("a required method `" + this.method + "' is not implemented")).toString();
    }
    else {
        return this.Super(NotImplementedError)("toString")();
    }
};

