Function.prototype.bind = function ( o ) {
    var f = this;
    return function ( ) {
        return f.apply(o, arguments);
    };
};
