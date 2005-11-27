//@jsmodpp
//@namespace data.error

//@export makeErrorClass
function makeErrorClass ( name ) {
    var func = new Function("m", "if ( arguments.length ) this.message = m");
    var proto = func.prototype = new Error();
    proto.name    = name;
    proto.message = "something's wrong";
    return func;
}
