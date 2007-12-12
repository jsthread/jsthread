use Getopt::Compact;
use File::Copy::Recursive "dircopy";

my $go = Getopt::Compact->new(
    args  => "FROM TO",
    modes => ["svn"],
);
local *opts = $go->opts;

unless ( @ARGV == 2 ) {
    print $go->usage;
    exit;
}


my ($from, $to) = @ARGV;
$from = "."  unless length $from;
$to   = "."  unless length $to;

while ( <$from/*> ) {
    next unless -d $_;
    print "$_...";
    if ( $opts{svn} ) {
        system "svn", "export", "--force", "$_/trunk/lib", "$to";
    } else {
        eval{ dircopy "$_/trunk/lib", "$to" }  or print($@), next;
        print "exported.\n";
    }
}
