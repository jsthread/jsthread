//@esmodpp
//@version 0.2.0
//@namespace Data.Iterator

//@require Data.Error
//@with-namespace Data.Error



//@export NoSuchElementError
var NoSuchElementError = newErrorClass(NAMESPACE + ".NoSuchElementError");
NoSuchElementError.prototype.message = "no such element";

