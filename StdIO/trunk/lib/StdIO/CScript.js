//@esmodpp 0.10.0
//@version 0.0.0

//@extend    StdIO
//@namespace StdIO

//@require Math.ToInteger
//@with-namespace Math

//@with-namespace WScript


Out.write = function ( /* variable args */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        StdOut.Write(arguments[i]);
    }
};


Err.write = function ( /* variable args */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        StdErr.Write(arguments[i]);
    }
};



var buffer = "";

In.read = function ( n ) {
    if ( this.atEOS() ) return null;
    n = ToInteger(n);
    while ( !StdIn.AtEndOfStream && buffer.length < n ) {
        buffer += StdIn.ReadLine() + "\n";
    }
    var r = buffer.substring(0, n);
    buffer = buffer.substring(n);
    return r;
};

In.unread = function ( str ) {
    buffer = str + buffer;
};

In.atEOS = function ( ) {
    return !buffer && StdIn.AtEndOfStream;
};

In.readLine = function ( ) {
    if ( this.atEOS() ) return null;
    var i, r;
    if ( (i=buffer.indexOf("\n")) >= 0 ) {
        r = buffer.substring(0, i);
        buffer = buffer.substring(i + 1);
    } else {
        r = buffer + StdIn.ReadLine();
        buffer = "";
    }
    return r;
};

In.readAll = function ( ) {
    if ( this.atEOS() ) return null;
    var t = buffer;
    buffer = "";
    if ( StdIn.AtEndOfStream ) {
        return t;
    } else {
        return t + StdIn.ReadAll();
    }
};

