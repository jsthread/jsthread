unless ( @ARGV ) {
    print "Input .js file name(s).";
    exit;
}

foreach ( @ARGV ) {
    while ( local $_ = glob($_) ) {
        print qq{<script language="JavaScript" type="text/javascript" src="$_"></script>\n};
    }
}

print <<'HTML';
<script language="JavaScript" type="text/javascript">
<!--
    function show ( /* variable arguments */ ) {
        for ( var i=0;  i < arguments.length;  i++ ) {
            document.write(arguments[i]);
        }
        document.write("<br>\n");
    }
//-->
</script>

HTML

while ( <*.t> ) {
    print <<"HTML";
<b>$_</b>
<div style="margin-left:2em; margin-bottom:2em;">
    <script language="JavaScript" type="text/javascript" src="$_"></script>
</div>
HTML
}

