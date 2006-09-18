//@esmodpp 0.10.0
//@version 0.1.0

//@extend    StdIO
//@namespace StdIO

//@require Math.ToInteger
//@with-namespace Math

//@require WebBrowser.GUI.DragAndDrop
var setDnD = WebBrowser.GUI.setDragAndDrop;



function createConsole ( name, left, top, zIndex ) {
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
    table.style.left        = left || "20px";
    table.style.top         = top  || "20px";
    table.style.zIndex      = zIndex;
    var tbody = table.appendChild( document.createElement("TBODY") );
    
    var title = tbody.appendChild( document.createElement("TR") )
                     .appendChild( document.createElement("TD") )
                     .appendChild( document.createElement("SPAN") );
    title.appendChild( document.createTextNode(name) );
    title.style.backgroundColor = "#EEEEEE";
    title.style.fontWeight = "bold";
    title.style.margin     = 0;
    title.style.padding    = "0.5ex";
    title.style.cursor     = "move";
    
    var console = tbody.appendChild( document.createElement("TR") )
                       .appendChild( document.createElement("TD") )
                       .appendChild( document.createElement("PRE") );
    console.style.backgroundColor = "#FFFFFF";
    console.style.border          = "solid 1px #EEEEEE";
    console.style.margin          = 0;
    console.style.fontFamily      = "monospace";
    console.style.whiteSpace      = "pre";
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
    
    if ( navigator.appName.indexOf("Microsoft") < 0 ) {  // IE6 does not support white-space property.
        var label = tools.appendChild( document.createElement("TD") );
        label.style.verticalAlign = "middle";
        label.style.paddingRight  = "10px";
        label = label.appendChild( document.createElement("LABEL") );
        var wrap  = document.createElement("INPUT");
        wrap.type = "checkbox";
        wrap.checked = false;
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
    
    var posX, posY;
    setDnD(title, {
        start: function ( e ) {
            posX = e.clientX;
            posY = e.clientY;
        },
        move: function ( e ) {
            table.style.left = parseInt(table.style.left) + e.clientX - posX + "px";
            table.style.top  = parseInt(table.style.top ) + e.clientY - posY + "px";
            posX = e.clientX;
            posY = e.clientY;
        }
    });
    
    var resizeX, resizeY;
    setDnD(resize, {
        start: function ( e ) {
            resizeX = e.clientX;
            resizeY = e.clientY;
        },
        move: function ( e ) {
            console.style.width  = parseInt(console.style.width ) + e.clientX - resizeX + "px";
            console.style.height = parseInt(console.style.height) + e.clientY - resizeY + "px";
            resizeX = e.clientX;
            resizeY = e.clientY;
        }
    });
    
    
    setTimeout(function(){
        if ( document.body ) {
            document.body.appendChild(table);
        } else {
            setTimeout(arguments.callee, 1);
        }
    }, 0);
    
    return {console:console, element:table};
}


// Create windows for StdOut, StdErr, and StdOut+StdErr.
with ( createConsole("StdOut+StdErr", "20px", "60px", 3) ) {
    var dblConsole = console;
    var dblElement = element;
}
with ( createConsole("StdOut"       , "40px", "40px", 2) ) {
    var outConsole = console;
    var outElement = element;
}
with ( createConsole("StdErr"       , "60px", "20px", 1) ) {
    var errConsole = console;
    var errElement = element;
}


// Move forward window when clicked.
dblElement.onmousedown = function ( ) {
    dblElement.style.zIndex = 3;
    if ( outElement.style.zIndex > errElement.style.zIndex ) {
        outElement.style.zIndex = 2;
        errElement.style.zIndex = 1;
    } else {
        outElement.style.zIndex = 1;
        errElement.style.zIndex = 2;
    }
};

outElement.onmousedown = function ( ) {
    outElement.style.zIndex = 3;
    if ( dblElement.style.zIndex > errElement.style.zIndex ) {
        dblElement.style.zIndex = 2;
        errElement.style.zIndex = 1;
    } else {
        dblElement.style.zIndex = 1;
        errElement.style.zIndex = 2;
    }
};

errElement.onmousedown = function ( ) {
    errElement.style.zIndex = 3;
    if ( dblElement.style.zIndex > outElement.style.zIndex ) {
        dblElement.style.zIndex = 2;
        outElement.style.zIndex = 1;
    } else {
        dblElement.style.zIndex = 1;
        outElement.style.zIndex = 2;
    }
};



// The following code defines StdIO methods.

function format ( /* variable args */ ) {
    var str = "";
    for ( var i=0;  i < arguments.length;  i++ ) str += arguments[i];
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\r\n|\n|\r/g, "<br>")
              .replace(/[ \xA0]{2}/g, function ( s ) {
                var r = "";
                var l = floor(s.length / 2);
                for ( var i=0;  i < l;  i++ ) r += "\xA0 ";
                if ( s.length % 2 ) r = "\xA0" + r;
                return r;
              });
}

Out.write = function ( /* variable args */ ) {
    var str = format.apply(null, arguments);
    outConsole.innerHTML += str;
    dblConsole.innerHTML += str;
};

Err.write = function ( /* variable args */ ) {
    var str = format.apply(null, arguments);
    errConsole.innerHTML += str;
    dblConsole.innerHTML += str;
};


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

