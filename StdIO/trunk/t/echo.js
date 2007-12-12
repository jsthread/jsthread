//@esmodpp
//@require StdIO
//@namespace StdIO

Out.writeln("Hello, ", "world!");
Out.write("Echo until EOS:");
var str;
while ( (str=In.readLine()) != null ) {
    Out.writeln(str);
}

In.unread("END.");
Out.writeLine(In.readAll());

