//@esmodpp
//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread.Compiler


//@export IdentifierSet
function IdentifierSet ( )
{
    this.set = {};
}

var proto = IdentifierSet.prototype;


var hasOwnProperty = Object.prototype.hasOwnProperty;

proto.has = function ( id )
{
    // Because "hasOwnProperty" itself can be used as identifier,
    // we need to avoid "this.set.hasOwnProperty".
    return hasOwnProperty.call(this.set, id.valueOf());
};


proto.add = function ( id )
{
    this.set[id.valueOf()] = id;
};


proto.remove = function ( id )
{
    delete this.set[id.valueOf()];
};


proto.toArray = function ( )
{
    var arr = [];
    for ( var i in this.set ) {
        if ( hasOwnProperty.call(this.set, i) ) arr.push(this.set[i]);
    }
    return arr;
};

