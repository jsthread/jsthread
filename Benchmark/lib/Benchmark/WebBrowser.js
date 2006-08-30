//@esmodpp
//@version 0.0.0

//@require   Benchmark
//@namespace Benchmark


var el = document.createElement("DIV");
el.style.backgroundColor = "#EEEEEE";
el.style.fontFamily      = "monospace";
el.style.padding         = "0.5em";

setTimeout(function(){
    if ( document.body ) {
        document.body.appendChild(el);
    } else {
        setTimeout(arguments.callee, 1);
    }
}, 0);



PRINT = function ( str ) {
    el.innerHTML += str.replace(/&/g, "&amp;")
                       .replace(/ /g, "&nbsp;")
                       .replace(/</g, "&lt;")
                       .replace(/>/g, "&gt;")
                       .replace(/\n/g, "<br>");
};


WARN = function ( str ) {
    alert(str);
};

