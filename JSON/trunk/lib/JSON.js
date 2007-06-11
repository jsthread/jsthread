//@esmodpp
//@namespace JSON
//@version 0.0.0


var DUMPER = "JSON.dumper";


//@export dump
function dump ( data, opts ) {
    opts = opts || {};
    var indent = String(opts.indent);
    if ( !indent.match(/^\s*$/) ) indent = "  ";
    return dump_main(data, {pretty:opts.pretty, indent:indent, deflate:opts.deflate});
}


function dump_main ( data, opts ) {
    switch ( typeof data ) {
      case "undefined":
        return opts.deflate ? '(void 0)' : '"undefined"';

      case "boolean":
      case "number":
        return String(data);

      case "string":
        return dump_string(data);

      case "function":
      case "object":
        if ( data === null ) {
            return "null";
        } else if ( typeof data[DUMPER] == "function" ){
            return data[DUMPER](opts);
        } else if ( data instanceof Array ) {
            var arr = [];
            for ( var i=0;  i < data.length;  i++ ) arr[i] = dump_main(data[i], opts);
            if ( opts.pretty ) {
                return "[\n" + arr.join(",\n").replace(/^/mg, opts.indent) + "\n]";
            } else {
                return "[" + arr.join(",") + "]";
            }
        } else {
            var arr = [];
            for ( var i in data ) {
                if ( data.hasOwnProperty(i) ) {
                    arr.push(dump_string(i) + ":" + dump_main(data[i], opts));
                }
            }
            if ( opts.pretty ) {
                return "{\n" + arr.join(",\n").replace(/^/mg, opts.indent) + "\n}";
            } else {
                return "{" + arr.join(",") + "}";
            }
        }
    }
}


function dump_string ( str ) {
    return '"' + str.replace(/[^\u0020-\u0021\u0023-\u005B\u005D-\u007E]/g, function (c){
                             // any ASCII character except '"', '\' and control-character
        c = c.charCodeAt(0);
        switch ( c ) {
          case '"' : return '\\"';
          case '\\': return '\\\\';
          case '\b': return '\\b';
          case '\f': return '\\f';
          case '\n': return '\\n';
          case '\r': return '\\r';
          case '\t': return '\\t';
          default:
            c = c.toString(16);
            while ( c.length < 4 ) c = "0" + c;
            return "\\u" + c;
        }
    }) + '"';
}



String.prototype[DUMPER] = function ( opts ) {
    return opts.deflate ? "new String(" + dump_string(this.toString()) + ")"
                        : dump_string(this.toString());
};

Boolean.prototype[DUMPER] = function ( opts ) {
    return opts.deflate ? "new Boolean(" + this.toString() + ")"
                        : this.toString();
};

Number.prototype[DUMPER] = function ( opts ) {
    return opts.deflate ? "new Number(" + this.toString() + ")"
                        : this.toString();
};

Date.prototype[DUMPER] = function ( opts ) {
    return opts.deflate ? "new Date(" + this.valueOf() + ")"
                        : dump_string(this.toString());
};

RegExp.prototype[DUMPER] = function ( opts ) {
    return opts.deflate ? this.toString()
                        : dump_string(this.toString());
};

Function.prototype[DUMPER] = function ( opts ) {
    return opts.deflate ? this.toString()
                        : dump_string(this.toString());
};


