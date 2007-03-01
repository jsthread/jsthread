//@esmodpp
//@version 0.4.0
//@namespace Data.Functional



//@export ignore
function ignore ( /* variable arguments */ ) {
    throw new IgnoreException(arguments);
}


//@export IgnoreException
function IgnoreException ( args ) {
    this.args = args;
}
var proto = IgnoreException.prototype;
proto.name    = NAMESPACE + ".IgnoreException";
proto.message = "unusual use of `ignore' (this should be caught by `forEach' or other iteration-methods).";

