//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Function.Extend


test(10, function(){
    
    function SuperClass ( x ) {
        this.prop1 = x;
    }
    SuperClass.prototype.foo = function ( ) {
        return "foo";
    };
    SuperClass.prototype.getProp = function ( ) {
        return this.prop1;
    };
    
    
    var SubClass = SuperClass.extend(function($super, x){
        $super("hoge");
        this.prop2 = x;
    },
    {
        bar: function ( ) {
            return "bar";
        },
        getProp: function ( ) {
            return this.prop2;
        }
    });
    
    
    var obj = new SubClass("fuga");
    
    ok( obj instanceof SubClass );
    ok( obj instanceof SuperClass );
    
    ok( obj.prop1 === "hoge" );
    ok( obj.prop2 === "fuga" );
    
    ok( obj.foo() === "foo" );
    ok( obj.bar() === "bar" );
    
    ok( obj.$super() === SuperClass );
    ok( obj.$super("foo")() === "foo" );
    
    ok( obj.getProp() === "fuga" );
    ok( obj.$super("getProp")() === "hoge" );
    
});
