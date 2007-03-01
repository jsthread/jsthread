//@esmodpp
//@version 0.4.0
//@namespace Data.Functional



//@export discontinue
function discontinue ( /* variable arguments */ ) {
    throw new DiscontinueException(arguments);
}


//@export DiscontinueException
function DiscontinueException ( args ) {
    this.args = args;
}
var proto = DiscontinueException.prototype;
proto.name    = NAMESPACE + ".DiscontinueException";
proto.message = "unusual use of `discontinue' (this should be caught by `forEach' or other iteration-methods).";

