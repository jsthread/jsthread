//@esmodpp 0.10.0
//@version 0.0.0
//@namespace StdIO

//@require Data.Error.NotImplementedError
//@with-namespace Data.Error


//@export Out
var Out = {};

Out.write = function ( /* variable args */ ) {
    throw new NotImplementedError(undefined, "write");
};

Out.writeLine = function ( /* variable args */ ) {
    arguments.length++;
    arguments[arguments.length-1] = "\n";
    return this.write.apply(this, arguments);
};

Out.writeln = Out.writeLine;


//@export Err
var Err = {};

for ( var i in Out ) {
    Err[i] = Out[i];
}


//@export In
var In = {};

In.read = function ( n ) {
    throw new NotImplementedError(undefined, "read");
};

In.unread = function ( str ) {
    throw new NotImplementedError(undefined, "unread");
};

In.atEOS = function ( ) {
    throw new NotImplementedError(undefined, "atEOS");
};

In.readLine = function ( ) {
    if ( this.atEOS() ) return null;
    var buf = [];
    var c;
    while ( (c=this.read(1)) != null && c != "\n" ) {
        buf.push(c);
    }
    return buf.join("");
};

In.readln = In.readLine;

In.readAll = function ( ) {
    if ( this.atEOS() ) return null;
    var buf = [];
    var c;
    while ( (c=this.read(1)) != null ) {
        buf.push(c);
    }
    return buf.join("");
};

