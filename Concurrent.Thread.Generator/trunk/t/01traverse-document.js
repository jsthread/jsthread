//@esmodpp
//@require Concurrent.Thread.Ports.Test.Simple
//@with-namespace Test.Simple

//@require Concurrent.Thread.Generator
//@require Concurrent.Thread.Compiler
//@with-namespace Concurrent


test({
    name     : "traverse-document",
    tests    : 6,
    test_case: eval(Thread.prepare(function(){
        
        
        if ( !(document && document.createElement) )
            throw "Skipped all test, because 'document' object does not exists.";
        
        
        function enumElements ( root ) {
            return function ( generate ) {
                function traverse ( elem ) {
                    for ( var i=0;  i < elem.childNodes.length;  i++ ) {
                        var n = elem.childNodes[i];
                        if ( n.nodeType === 1 ) {
                            generate(n);
                            traverse(n);
                        }
                    }
                }
                traverse(root);
            };
        }
        
        var doc = document.createElement("DIV");
        doc.innerHTML = [
            "<h1>head1</h1>",
            "<div><span>some</span> text</div>",
            "<h2>head2</h2>",
            "<p>paragraph</p>",
        ].join("");
        
        var g = new Thread.Generator(enumElements(doc));
        ok( g.next().nodeName.match(/^h1$/i) );
        ok( g.next().nodeName.match(/^div$/i) );
        ok( g.next().nodeName.match(/^span$/i) );
        ok( g.next().nodeName.match(/^h2$/i) );
        ok( g.next().nodeName.match(/^p$/i) );
        ok( !g.hasNext() );
        
        
    }))
});
