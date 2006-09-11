//@esmodpp
//@version 0.0.1

//@require Data.Error
//@namespace Data.Error


//@export IndexOutOfBoundsError
var IndexOutOfBoundsError = newErrorClass(NAMESPACE + ".IndexOutOfBoundsError");
IndexOutOfBoundsError.prototype.message = "index out of bounds";

