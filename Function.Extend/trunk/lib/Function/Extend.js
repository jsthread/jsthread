//@esmodpp
//@version 0.0.0

//@require        Function.Bind
//@require        Util.Arrayize
//@with-namespace Util.Arrayize



var null_constructor = function (){};

Function.prototype.extend = function extend ( init, props ) {
    if ( typeof init !== "function" ) throw new TypeError("function is expected: " + init);
    if ( props == null ) props = {};
    
    var SuperClass = this;
    var SubClass = function ( ) {
        var self = this;
        var super_is_called = false;
        function super_call ( ) {
            if ( super_is_called ) throw new Error("super-constructor has already been called");
            super_is_called = true;
            var ret_val = SuperClass.apply(self, arguments);
            if ( ret_val instanceof Object ) {
                for ( var i in ret_val ) {
                    if ( ret_val.hasOwnProperty(i) ) self[i] = ret_val[i];
                }
            }
            return ret_val;
        }
        arguments = arrayize(arguments);
        arguments.unshift(super_call);
        return init.apply(self, arguments);
    };
    
    null_constructor.prototype = SuperClass.prototype;
    var proto = SubClass.prototype = new null_constructor;
    proto.constructor = SubClass;
    proto.$super = function ( prop ) {
        if ( !arguments.length ) return SuperClass;
        var value = SuperClass.prototype[prop];
        if ( typeof value === "function" ) {
            return value.bind(this);
        } else {
            return value;
        }
    };
    for ( var i in props ) proto[i] = props[i];
    
    return SubClass;
};

