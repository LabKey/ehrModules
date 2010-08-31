/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
//Compute the intersection of n arrays
Array.prototype.intersect = function()
{
    if (!arguments.length)
        return [];
    var a1 = this;
    var a = a2 = null;
    var n = 0;
    while (n < arguments.length)
    {
        a = [];
        a2 = arguments[n];
        var l = a1.length;
        var l2 = a2.length;
        for (var i = 0; i < l; i++)
        {
            for (var j = 0; j < l2; j++)
            {
                if (a1[i] === a2[j])
                    a.push(a1[i]);
            }
        }
        a1 = a;
        n++;
    }
    return a.unique();
};

//Return new array with duplicate values removed
Array.prototype.unique = function()
{
    var a = [];
    var l = this.length;
    for (var i = 0; i < l; i++)
    {
        for (var j = i + 1; j < l; j++)
        {
            // If this[i] is found later in the array
            if (this[i] === this[j])
                j = ++i;
        }
        a.push(this[i]);
    }
    return a;
};

Array.prototype.subtract = function(a2, compareFunction){
    if (! compareFunction) compareFunction = null;

    var a1 = this.unique();

    if (! a2) return a1;

    var a2 = a2.unique();
    var len2 = a2.length;

    if (compareFunction){
        for (var i = 0; i < a1.length; i++){
            var src = a1[i], found = false, src;

            for (var j = 0; j < len2 && compareFunction(src2 = a2[j], src) != 1; j++)
                if (compareFunction(src, src2) == 0){
                    found = true;
                    break;
                }

            if (found) a1.splice(i--, 1);
        }
    }
    else{
        for (var i = 0; i < a1.length; i++){
            var src = a1[i], found = false, src;

            for (var j = 0; (j < len2) && (src >= (src2 = a2[j])); j++)
                if (src2 == src){
                    found = true;
                    break;
                }

            if (found) a1.splice(i--, 1);
        }
    }

    return a1;
}

if( typeof Array.prototype.concat==='undefined' ) {
 Array.prototype.concat = function( a ) {
  for( var i = 0, b = this.copy(); i<a.length; i++ ) {
   b[b.length] = a[i];
  }
  return b;
  };
}

Array.prototype.removeDuplicates = function(compareFunction){
    if (! compareFunction) compareFunction = null;

    var a1 = this.concat().sort(compareFunction);

    if (compareFunction){
        for (var i = 0; i < a1.length; i++){
            var src = a1[i];

            for (var j = i + 1; j < a1.length && compareFunction(a1[j], src) == 0; j++)
                {
                }

            if (j - 1 > i) a1.splice(i + 1, j - i - 1);
        }
    }
    else{
        for (var i = 0; i < a1.length; i++){
            var src = a1[i];

            for (var j = i + 1; j < a1.length && a1[j] == src; j++)
                {
                }

            if (j - 1 > i) a1.splice(i + 1, j - i - 1);
        }
    }

    return a1;
}

if( typeof Array.prototype.contains==='undefined' ) {
Array.prototype.contains = function(s){
    for (var i = 0; i < this.length; ++ i){
        if (this[i] === s){
            return true;
        }
    }

    return false;
};
}


if( typeof Array.prototype.caseInsensitiveContains==='undefined' ) {
Array.prototype.caseInsensitiveContains = function(s){
    for (var i = 0; i < this.length; ++ i){
        if (this[i].toLowerCase() === s.toLowerCase()){
            return true;
        }
    }

    return false;
};
}