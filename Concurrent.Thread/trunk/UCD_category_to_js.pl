use DateTime;
use DateTime::Format::Mail;
use constant LEFT  => 0;
use constant RIGHT => 1;

unless ( @ARGV ) {
    print STDERR <<HERE;
Specify shorten-form(s) of general categories in Unicode.

SYNOPSIS:
  perl $0 Lu Ll Lt Lm Lo Nl < DerivedGeneralCategory.txt
HERE
    exit 1;
}

my @line = ();
my %category = map{($_, 1)} @ARGV;

while ( <STDIN> ) {
    /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*(\w{2})/  or next;
    next unless $category{$3};
    push @line, [hex($1), hex($2||$1)];
}

@line = sort{$a->[LEFT] <=> $b->[LEFT]} @line;
for ( my $i=0;  $i < $#line;  $i++ ) {
    if ( $line[$i][RIGHT]+1 == $line[$i+1][LEFT] ) {
        $line[$i][RIGHT] = $line[$i+1][RIGHT];
        splice @line, $i+1, 1;
        redo;
    }
}

print "// #generated# Last update: ",
      DateTime::Format::Mail->format_datetime(DateTime->now(time_zone=>"GMT")), "\n";

foreach ( grep{ $_->[LEFT] != $_->[RIGHT] } @line ) {
    printf "if ( 0x%X <= c && c <= 0x%X ) return true;\n", $_->[LEFT], $_->[RIGHT];
}

print "switch ( c ) {\n";

foreach ( grep{ $_->[LEFT] == $_->[RIGHT] } @line ) {
    printf "case 0x%X:\n", $_->[LEFT];
}

print <<HERE;
    return true;
default:
    return false;
}
// #/generated#
HERE


