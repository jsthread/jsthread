with ( data ) {
	var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	var x = 0;
	for ( var i=0;  i < a.length;  i++ ) {
	    if ( a[i] % 3 == 0 ) x += a[i]*a[i];
	}
	show("x = " + x);
	
	var l = LinkedList.fromArray(a);
	var y = l.filter(function(x){
	            return x % 3 == 0
	        }).map(function(x){
	            return x*x
	        }).foldl(function(x, y){
	            return x + y
	        }, 0);
	show("y = " + y);
	
	var z = l.filter(function(x){
	            return x % 3 == 0
	        }).map(function(x){
	            return x*x
	        }).foldr1(function(x, y){
	            return x + y
	        });
	show("z = " + z);
	
	if ( x != y || y != z ) throw new Error("Failed.");
	show("OK.");
}
