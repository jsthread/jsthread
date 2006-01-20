with ( data ) {
	var n = 5;
	var a = [];
	for ( var i=0;  i < n;  i++ ) a[i] = Math.random();
	
	var l1 = new LinkedList(a[0], a[1], a[2], a[3], a[4]);
	var l2 = LinkedList.fromArray(a);
	
	for ( var it1=l1.iterator(), it2=l2.iterator();
	      !it1.isTail() && !it2.isTail();
	      it1=it1.next(), it2=it2.next() ) {
	    show("l1: " + it1.value() + ",  l2: " + it2.value());
	    if ( it1.value != it2.value ) throw new Error("Innequivalent value!");
	}
	if ( !it1.isTail() ) throw new Error("it1 is not at the tail.");
	if ( !it2.isTail() ) throw new Error("it2 is not at the tail.");
	
	if ( !l1.equals(l2) ) throw new Error("equals failed!");
	if ( !l1.copy().equals(l1) ) throw new Error("copied object must equals to its original!!");
	
	show("OK.");
}
