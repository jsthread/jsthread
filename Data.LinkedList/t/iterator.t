with ( data ) {
	var n = 10;
	var a = [];
	for ( var i=0;  i < n;  i++ ) a[i] = Math.random();
	
	var l = LinkedList.fromArray(a);
	
	for ( var i=0, it=l.iterator();  i < n;  i++, it=it.next() ) {
	    show("array: " + a[i] + ",  list: " + it.value());
	    if ( a[i] != it.value() ) throw new Error("Innequivalent value.");
	    if ( it.isTail() ) throw new Error("Unexpected tail of list.");
	}
	if ( !it.isTail() ) throw new Error("It must be tail of the list.");
	
	show("OK.");
}
