//@esmodpp
//@namespace WebBrowser.Shell
//@version 0.0.0

//@require StdIO.WebBrowser


var div = document.createElement("DIV");
var textarea = div.appendChild( document.createElement("TEXTAREA") );
textarea.style.width  = "500px";
textarea.style.height = "150px";

div.appendChild( document.createElement("BR") );
var button = document.createElement("INPUT");
button.type  = "button";
button.value = "eval";
button.onclick = exec;
div.appendChild(button);
div.style.position = "absolute";
div.style.left = "400px";
div.style.top  = "450px";

function init ( ) {
    if ( document.body ) {
        document.body.appendChild(div);
        document.onkeydown = function ( e ) {
            if ( !e ) e = window.event;
            if ( e.ctrlKey ) {
                switch ( e.keyCode ) {
                    case 13:  // Enter
                        exec();
                        break;;
                    case 38:  // Up
                        history_back();
                        break;
                    case 40:  // Down
                        history_forward();
                        break;
                }
            }
        };
        textarea.focus();
    } else {
        setTimeout(init, 100);
    }
}
init();


var History = [];

History.search = function ( code ) {
    for ( var i=0;  i < this.length;  i++ ) {
        if ( this[i] == code ) return i;
    }
    return -1;
};

History.register = function ( code ) {
    var i = this.search(code);
    if ( i >= 0 ) return i;
    return this.push(code) - 1;
};


function history_back ( ) {
    var code = textarea.value;
    if ( code ) {
        var i = History.register(code);
        textarea.value = i > 0 ? History[i-1] : "";
    } else {
        if ( History.length ) textarea.value = History[History.length-1];
    }
};

function history_forward ( ) {
    var code = textarea.value;
    if ( code ) {
        var i = History.register(code);
        textarea.value = i < History.length-1 ? History[i+1] : "";
    } else {
        if ( History.length ) textarea.value = History[0];
    }
};

function exec ( ) {
    var code = textarea.value;
    var i = History.search(code);
    if ( i >= 0 ) History.splice(i, 1);
    History.register(code);
    try {
        StdIO.Out.writeln("> " + ($_ = eval(code)));
    } catch ( e ) {
        StdIO.Err.writeln("Exception thrown: [" + e.name + "] " + e.message);
        if ( e.stack ) StdIO.Err.writeln(e.stack);
    }
    textarea.value = "";
}

