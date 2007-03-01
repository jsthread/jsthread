//@esmodpp
//@version 0.0.0


Object.prototype.spawn = function ( ) {
    dummy.prototype = this;
    return new dummy;
};

function dummy ( ) { }

