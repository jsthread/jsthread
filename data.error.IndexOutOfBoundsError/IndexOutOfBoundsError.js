//@esmodpp
//@version 0.0.0

//@require data.error
//@namespace data.error


//@export IndexOutOfBoundsError
var IndexOutOfBoundsError = newErrorClass(NAMESPACE + "IndexOutOfBoundsError");
IndexOutOfBoundsError.prototype.message = "index out of bounds";
