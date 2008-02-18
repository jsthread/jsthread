//@esmodpp
//@require Concurrent.Thread.Ports.Test.Simple
//@with-namespace Test.Simple

//@require Concurrent.Thread.Mutex
//@require Concurrent.Thread.Compiler
//@with-namespace Concurrent

//@require Data.Error.IllegalStateError
//@with-namespace Data.Error



test({
    name     : "mutex",
    tests    : 12,
    test_case: eval(Thread.prepare(function(){
        
        
        var m = new Thread.Mutex();
        
        var th1 = Thread.create(function(){
            ok( m.isAcquirable()   ,  "initially acquirable" );
            m.acquire();
            ok( !m.isAcquirable()  , "acquire'd correctly" );
            Thread.sleep(2000);
            m.release();
            ok( !m.isAcquirable()   , "release'd by th1 (still unacquirable)");
        });
        
        var th2 = Thread.create(function(){
            Thread.sleep(1000);
            ok( !m.isAcquirable()  , "not acquirable by th2" );
            try {
                m.release();
                ok( false                           , "bad release" );
            } catch ( e ) {
                ok( e instanceof IllegalStateError  , "bad release" );
            }
            m.acquire();
            ok( !m.isAcquirable()  , "acquire'd by th2");
            Thread.sleep(1000);
            m.release();
            ok( !m.isAcquirable()   , "release'd by th2 (still unacquirable)");
        });
        
        var th3 = Thread.create(function(){
            Thread.sleep(1500);
            ok( !m.isAcquirable()  , "not acquirable by th3");
            m.acquire();
            ok( !m.isAcquirable()  , "acquire'd by th3");
            Thread.sleep(1000);
            m.release();
            ok( m.isAcquirable()   , "release'd by th3 (at last acquirable again)");
        });
        
        var th4 = Thread.create(function(){
            Thread.sleep(1800);
            ok( !m.isAcquirable()  , "not acquirable by th4");
            try {
                m.acquire();
                ok( false              , "not interrupted" );
            } catch ( e ) {
                ok( e === "interrupt"  , "interrupted: " + e );
            }
        });
        
        th1.join();
        th4.notify("interrupt");
        th4.join();
        th2.join();
        th3.join();
        
    }))
});

