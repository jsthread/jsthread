//@esmodpp
//@version 0.1.0


Function.prototype.bind = function ( o ) {
    var f = this;
    return function ( ) {
        return f.apply(o, arguments);
    };
};
