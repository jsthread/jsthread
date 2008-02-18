//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.JSON.RPC

//@require Concurrent.Thread.Compiler
//@require Concurrent.Thread.Http
//@with-namespace Concurrent

//@require        JSON
//@with-namespace JSON
//@require        Util.Arrayize
//@with-namespace Util.Arrayize

//@require        Data.Error 0.3.0
//@with-namespace Data.Error



//@export bind
function bind ( opts ) {
    if ( !(opts instanceof Object) ) throw new TypeError("argument for " + NAMESPACE + ".bind must be a hash.");
    var request = opts.request;
    if ( request != null ) {
        if ( !String(request).match(/^(?:GET|POST)$/i) ) throw new Error('"request" option must be "GET" or "POST".');
    } else {
        request = "POST";
    }
    var params = opts.params;
    if ( params != null ) {
        if ( !String(params).match(/^(?:Named|Positioned)$/i) ) throw new Error('"params" option must be "Named" or "Positioned".');
    } else {
        params = "Named";
    }
    var body;
    if ( request.match(/^POST$/i) ) {
        if ( params.match(/^Named$/i) ) {
            body = makeNamedPost(opts.url, opts.method);
        } else {
            body = makePositionedPost(opts.url, opts.method);
        }
    } else {
        if ( params.match(/^Named$/i) ) {
            body = makeNamedGet(opts.url, opts.method);
        } else {
            body = makePositionedGet(opts.url, opts.method);
        }
    }
    var with_pre;
    var pre = opts.preprocess;
    if ( pre != null ) {
        if ( typeof pre != "function" ) throw new TypeError('"preprocess" option must be function');
        with_pre = eval(Thread.prepare(function(){
            return body.apply(this, pre.apply(this, arguments));
        }));
    } else {
        with_pre = body;
    }
    var post = opts.postprocess;
    if ( post != null ) {
        if ( typeof post != "function" ) throw new TypeError('"preprocess" option must be function');
        return eval(Thread.prepare(function(){
            return post(with_pre.apply(this, arguments));
        }));
    } else {
        return with_pre;
    }
}


var COMMON_HEADERS = [
    'User-Agent'  , 'Concurrent.Thread.JSON.RPC',
    'Accept'      , 'application/json'
];

var POST_HEADERS = COMMON_HEADERS.concat(
    'Content-type', 'application/json'
);

function makeNamedPost( url, method ) {
    return eval(Thread.prepare(
        function ( /* variable arguments */ ) {
            var res = Thread.Http.post(url, dump({
                version: "1.1",
                method : method,
                params : args2params(arguments)
            }), POST_HEADERS);
            res = eval("(" + res.responseText + ")");
            if ( res.error ) throw new JSONRPCError(res.error);
            return res.result;
        }
    ));
};

function makePositionedPost ( url, method ) {
    return eval(Thread.prepare(
        function ( /* variable arguments */ ) {
            var res = Thread.Http.post(url, dump({
                version: "1.1",
                method : method,
                params : arrayize(arguments)
            }), POST_HEADERS);
            res = eval("(" + res.responseText + ")");
            if ( res.error ) throw new JSONRPCError(res.error);
            return res.result;
        }
    ));
};

function makeNamedGet ( url, method ) {
    url = url.replace(/\/+$/, "") + "/" + encodeURIComponent(method) + "?";
    return eval(Thread.prepare(
        function ( /* variable arguments */ ) {
            var res = Thread.Http.get(url + params2query(args2params(arguments)), COMMON_HEADERS);
            res = eval("(" + res.responseText + ")");
            if ( res.error ) throw new JSONRPCError(res.error);
            return res.result;
        }
    ));
};

function makePositionedGet ( url, method ) {
    url = url.replace(/\/+$/, "") + "/" + encodeURIComponent(method) + "?";
    return eval(Thread.prepare(
        function ( /* variable arguments */ ) {
            arguments[arguments.length] = {};
            arguments.length++;
            var res = Thread.Http.get(url + params2query(args2params(arguments)), COMMON_HEADERS);
            res = eval("(" + res.responseText + ")");
            if ( res.error ) throw new JSONRPCError(res.error);
            return res.result;
        }
    ));
};

function args2params ( args ) {
    var params = {};
    if ( args.length ) {
        var hash = args[args.length-1];
        if ( !(hash instanceof Object) ) throw new Error("the last argument must be a hash");
        for ( var i in hash ) {
            if ( hash.hasOwnProperty(i) ) params[i] = hash[i];
        }
        for ( var i=0;  i < args.length-1;  i++ ) {
            params[i] = args[i];
        }
    }
    return params;
}

function params2query ( params ) {
    var query = [];
    for ( var i in params ) {
        if ( !params.hasOwnProperty(i) ) continue;
        if ( params[i] instanceof Array ) {
            var arr = params[i];
            for ( var j=0;  j < arr.length;  j++ ) {
                query.push(encodeURIComponent(i) + "=" + encodeURIComponent(arr[j]));
            }
        } else {
            query.push(encodeURIComponent(i) + "=" + encodeURIComponent(params[i]));
        }
    }
    return query.join("&");
}


//@export JSONRPCError
var JSONRPCError = Error.extend(
    function ( $super, e ) {
        if ( e instanceof Object ) {
            $super(e.message);
            for ( var i in e ) this[i] = e[i];
        } else {
            $super(e);
        }
    },
    {name: NAMESPACE + ".JSONRPCError"}
);
