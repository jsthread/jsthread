//@esmodpp
//@version 0.0.0
//@namespace Math

//@require Data.Functional.Enumerable
//@require Data.Iterator
//@with-namespace Data.Iterator



//@export Prime
var Prime = new Data.Functional.Enumerable();

var primes = [2];
var next   = 3;

Prime.iterator = function ( n )
{
    n = Math.floor(n) || 0;
    return new Iterator( n < 0 ? 0 : n );
};

Prime.get = function ( n )
{
    if ( n < 0 ) return undefined;
    n = Math.floor(n);
    if ( isNaN(n) ) return undefined;
    return this.iterator(n).value();
};



function Iterator ( n ) {
    this._index = n;
}

var proto = Iterator.prototype = new BidirectionalIterator();

proto.isTail = function ( ) {
    return false;
};

proto.isHead = function ( ) {
    return this._index == 0;
};

proto.next = function ( ) {
    return new Iterator(this._index+1);
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError("no previous element before the head");
    return new Iterator(this._index-1);
};

proto.value = function ( ) {
    while ( this._index >= primes.length ) {
        FIND: for ( ;; ) {
            for ( var i=0;  primes[i]*primes[i] <= next;  i++ ) {
                if ( next % primes[i] == 0 ) {
                    next += 2;
                    continue FIND;
                }
            }
            break FIND;
        }
        primes.push(next);
        next += 2;
    }
    return primes[this._index];
};

