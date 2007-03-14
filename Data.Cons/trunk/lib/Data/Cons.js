//@esmodpp
//@version 0.2.0
//@namespace Data.Cons



//@export Cell
function Cell ( car, cdr ) {
    this.car = car;
    this.cdr = cdr;
}

var proto = Cell.prototype;

proto.toString = function ( ) {
    return "(" + this.car + " . " + this.cdr + ")";
};

proto.toLocaleString = function ( ) {
    return "("
         + (this.car == null ? String(this.car) : this.car.toLocaleString)
         + " . "
         + (this.cdr == null ? String(this.cdr) : this.cdr.toLocaleString)
         + ")";
};

proto.isNil = function ( ) {
    return false;
};



//@export Nil
function Nil ( ) {
    this.car = this;
    this.cdr = this;
}

var proto = Nil.prototype = new Cell();
proto.constructor = Nil;

proto.toString       = 
proto.toLocaleString = function ( ) {
    return "nil";
};

proto.isNil = function ( ) {
    return true;
};



//@export nil
function nil ( ) {
    return new Nil();
};


//@export cons
function cons ( car, cdr ) {
    return new Cell(car, cdr);
}


//@export car
function car ( cell ) {
    return cell.car;
}


//@export cdr
function cdr ( cell ) {
    return cell.cdr;
}

