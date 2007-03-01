//@esmodpp
//@version 0.0.0
//@namespace Data


//@export Stack
function Stack ( )
{
    this.length = 0;
}

var proto = Stack.prototype;

proto.pop  = Array.prototype.pop;
proto.push = Array.prototype.push;

proto.peek = function ( )
{
    return this.length > 0
             ?  this[this.length-1]
             :  undefined;
};

proto.isEmpty = function ( )
{
    return this.length == 0;
};
