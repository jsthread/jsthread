//@esmodpp
//@version 0.4.0
//@namespace Data.Functional



//@export return_list
function return_list ( /* variable arguments */ ) {
    throw new ReturnListException(arguments);
}


//@export ReturnListException
function ReturnListException ( args ) {
    this.args = args;
}
var proto = ReturnListException.prototype;
proto.name    = NAMESPACE + ".ReturnListException";
proto.message = "unusual use of `return_list' (this should be caught by `forEach' or another iteration-methods).";

