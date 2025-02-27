/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


LABKEY.equals = function( x, y ) {
    if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

    if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for ( var p in x ) {
        if ( ! x.hasOwnProperty( p ) ) continue;
        // other properties were tested using x.constructor === y.constructor

        if ( ! y.hasOwnProperty( p ) )
            return p;
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if ( x[ p ] === y[ p ] ) continue;
        // if they have the same strict value or identity then they are equal

        if ( typeof( x[ p ] ) !== "object" )
            return p;
        // Numbers, Strings, Functions, Booleans must be strictly equal

        var result = LABKEY.equals( x[ p ],  y[ p ] );
        if ( result !== true  )
            return result;
        // Objects and Arrays must be tested recursively
    }

    for ( p in y ) {
        if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) )
            return p;
        // allows x[ p ] to be set to undefined
    }
    return true;
};