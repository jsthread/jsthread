//@esmodpp
//@namespace Data.Functional.ArrayForceForEach

//@require Data.Functional.Array


// This module forces into overwriting `forEach' method of Array.
// Since SpiderMonkey has built-in version of `forEach', 
// it is not overwritten by default.

//@shared builtinForEach
builtinForEach = Array.prototype.forEach;

Array.prototype.forEach = Data.Functional.List.prototype.forEach;

