//@esmodpp 0.10.0
//@version 0.1.0

//@extend    StdIO
//@namespace StdIO

//@require Math.ToInteger
//@with-namespace Math



/* Construct following structure.
    
    <table>
        <tbody>
            <tr>
                <td>
                    <span>title</span>
                </td>
            </tr>
            <tr>
                <td>
                    <div>console</div>
                </td>
            </tr>
            <tr>
                <td>
                    <table><tbody><tr>
                        <td>
                            <label><input type="checkbox" value="Wrap" /></label>
                        </td>
                        <td>
                            <input type="button" value="Clear" />
                        </td>
                        <td>
                            resize+
                        </td>
                    </tr></tbody></table>
                </td>
            </tr>
        </tbody>
    </table>
 */

var table = document.createElement("TABLE");
table.border      = 0;
table.cellPadding = 0;
table.cellSpacing = 0;
table.style.borderWidth = 0;
table.style.margin      = 0;
table.style.padding     = 0;
table.style.position    = "absolute";
table.style.left        = "20px";
table.style.top         = "20px";
var tbody = table.appendChild( document.createElement("TBODY") );

var title = tbody.appendChild( document.createElement("TR") )
                 .appendChild( document.createElement("TD") )
                 .appendChild( document.createElement("SPAN") );
title.appendChild( document.createTextNode("StdOut+StdErr") );
title.style.backgroundColor = "#EEEEEE";
title.style.fontWeight = "bold";
title.style.margin = 0;
title.style.padding = "0.5ex";


var console = tbody.appendChild( document.createElement("TR") )
                   .appendChild( document.createElement("TD") )
                   .appendChild( document.createElement("DIV") );
console.style.backgroundColor = "#FFFFFF";
console.style.border          = "solid 1px #EEEEEE";
console.style.margin          = 0;
console.style.fontFamily      = "monospace";
console.style.whiteSpace      = "normal";
console.style.padding         = "0.5em";
console.style.width           = "480px";
console.style.height          = "300px";
console.style.overflow        = "scroll";

var tools = tbody.appendChild( document.createElement("TR") )
                 .appendChild( document.createElement("TD") );
tools.align = "right";
tools.style.margin          = 0;
tools.style.padding         = 0;
tools.style.backgroundColor = console.style.backgroundColor;
tools.style.border          = console.style.border;
tools.style.borderTopWidth  = 0;
tools = tools.appendChild( document.createElement("TABLE") );
tools.border      = 0;
tools.cellPadding = 0;
tools.cellSpacing = 0;
tools.style.borderWidth = 0;
tools.style.margin      = 0;
tools.style.padding     = 0;
tools = tools.appendChild( document.createElement("TBODY") )
             .appendChild( document.createElement("TR") );

if ( navigator.appName.indexOf("Microsoft") < 0 ) {  // IE can't switch display mode.
    var label = tools.appendChild( document.createElement("TD") );
    label.style.verticalAlign = "middle";
    label.style.paddingRight  = "10px";
    label = label.appendChild( document.createElement("LABEL") );
    var wrap  = document.createElement("INPUT");
    wrap.type = "checkbox";
    wrap.checked = true;
    wrap.onclick = function ( e ) {
        if ( this.checked ) {
            console.style.whiteSpace = "normal";
        } else {
            console.style.whiteSpace = "pre";
        }
    };
    label.appendChild( wrap );
    label.appendChild( document.createTextNode("Wrap") );
}

var clear = tools.appendChild( document.createElement("TD") );
clear.style.verticalAlign = "middle";
clear.style.paddingRight  = "10px";
var clearButton = document.createElement("INPUT");
clearButton.type = "button";
clearButton.value = "Clear";
clearButton.onclick = function ( ) {
    console.innerHTML = "";
};
clear.appendChild( clearButton );

var resize = tools.appendChild( document.createElement("TD") );
resize.appendChild( document.createTextNode("┼") );
resize.style.fontSize        = "30px";
resize.style.fontFamily      = "monospace";
resize.style.backgroundColor = "#EEEEEE";
resize.style.borderWidth     = 0;
resize.style.padding         = 0;
resize.style.margin          = 0;
resize.style.cursor          = "nw-resize";


setTimeout(function(){
    if ( document.body ) {
        document.body.appendChild(table);
    } else {
        setTimeout(arguments.callee, 1);
    }
}, 0);



// The following code defines StdIO methods.


Out.write = function ( /* variable args */ ) {
    var str = "";
    for ( var i=0;  i < arguments.length;  i++ ) str += arguments[i];
    console.innerHTML += str.replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/\r\n|\n|\r/g, "<br>");
};


Err = Out;


var buffer = "";
var eos    = false;

In.read = function ( n ) {
    if ( this.atEOS() ) return null;
    n = ToInteger(n);
    while ( !eos && buffer.length < n ) {
        var s = prompt("Input a line or press cancel for end-of-stream.", "");
        if ( s == null ) {
            eos = true;
        } else {
            buffer += s + "\n";
        }
    }
    var r = buffer.substring(0, n);
    buffer = buffer.substring(n);
    return r;
};

In.unread = function ( str ) {
    buffer = str + buffer;
};

In.atEOS = function ( ) {
    return eos && !buffer;
};

