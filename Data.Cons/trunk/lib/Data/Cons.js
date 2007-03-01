//@esmodpp
//@version 0.1.0
//@namespace Data.Cons


//@export Cell
function Cell ( car, cdr ) {
    this.car = car;
    this.cdr = cdr;
}
Cell.prototype.constructor = Cell;

Cell.prototype.toString = function ( ) {
    return "(" + this.car + " . " + this.cdr + ")";
};

Cell.prototype.isNil = function ( ) {
    return false;
};


//@export nil
var nil = new Cell();
nil.toString = function ( ) { return "nil"; };
nil.isNil    = function ( ) { return true;  };


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

