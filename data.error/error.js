//@jsmodpp
//@namespace data.error

//@export Error
function Error ( /* delegate */ ) {
    var e = window.Error.apply(this, arguments);
    for ( var i in e ) {
        if ( i=='name' || i=='message' && !e[i] ) continue;
        this[i] = e[i];
    }
}
var proto = Error.prototype = new window.Error();
proto.name    = NAMESPACE + ".Error";
proto.message = "something's wrong";
proto.toString = function ( ) {
    var s = String(this.message);
    return  s  ?  this.name + ": " + s
               :  this.name;
};


//@export makeErrorClass
function makeErrorClass ( name ) {
    // Here, we'd like to use function operator, but do not.
    // Because that can cause "join"ing of Function objects.
    // See ECMA262-3 section 13.1.2 for details.
    var func = new Function(
        "var e = window.Error.apply(this, arguments);          " +
        "for ( var i in e ) {                                  " +
        "   if ( i=='name' || i=='message' && !e[i] ) continue;" +
        "   this[i] = e[i];                                    " +
        "}                                                     "
    );
    var proto = func.prototype = new Error();
    proto.name = name;
    return func;
}
