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
      DateTime::Format::Mail->format_datetime(DateTime->now(time_zone=>"Japan")), "\n";

(my $exp = make_exp(@line));# =~ s/\n/\n       /g;
print <<"HERE";
return $exp;
// #/generated#
HERE


sub make_exp {
    if ( @_ == 0 ) {
        return "false";
    }
    elsif ( @_ == 1 ) {
        if ( $_[0]->[LEFT] == $_[0]->[RIGHT] ) {
            return sprintf "c === 0x%X", $_[0]->[LEFT];
        }
        else {
            if ( defined $_[0]->[RIGHT] ) {
                return sprintf "0x%X <= c && c <= 0x%X", $_[0]->[LEFT], $_[0]->[RIGHT];
            }
            else {
                return sprintf "0x%X <= c", $_[0]->[LEFT];
            }
        }
    }
    else {
        my $d = int($#_ / 2);
        my $p = sprintf "c <= 0x%X", $_[$d]->[RIGHT];
        $_[$d]->[RIGHT] = undef;
        (my $t = make_exp(@_[0    .. $d ]));# =~ s/^/  /mg;
        (my $f = make_exp(@_[$d+1 .. $#_]));# =~ s/^/  /mg;
        return "$p ?\n$t :\n$f";
    }
}
