//@esmodpp
//@version 0.0.0
//@namespace data.conscell


//@export ConsCell
function ConsCell ( car, cdr ) {
    this.car = car;
    this.cdr = cdr;
}

ConsCell.prototype.toString = function ( ) {
    return "(" + this.car + " . " + this.cdr + ")";
};

ConsCell.prototype.isNil = function ( ) {
    return false;
};


//@export nil
var nil = new ConsCell();
nil.toString = function ( ) { return "nil"; };
nil.isNil    = function ( ) { return true;  };


//@export cons
function cons ( car, cdr ) {
    return new ConsCell(car, cdr);
}


//@export car
function car ( cell ) {
    return cell.car;
}


//@export cdr
function cdr ( cell ) {
    return cell.cdr;
}

