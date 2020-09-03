/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext4.namespace('ViralLoad.Utils');

ViralLoad.Utils = new function(){
    var lookup = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.".split("");

    return {
        compressUUID: function (uuid) {
            // Remove any hyphens
            uuid = uuid.replace(/-/g, "");

            var base16Triples = uuid.match(/.{1,3}/g);

            var base64Duples = base16Triples.map(function (base16Number) {
                var integer = parseInt(base16Number, 16);

                var firstPart = Math.floor(integer / 64);
                var secondPart = integer % 64;

                return "" + lookup[firstPart] + lookup[secondPart];
            });

            return base64Duples.join("");
        },

        uncompressUUID: function (compressedUUID) {
            var base64Duples = compressedUUID.match(/.{1,2}/g);
            var lastIndex = base64Duples.length - 1;

            var base16Duples = base64Duples.map(function (base64Set, curIndex) {
                var firstPart = lookup.indexOf(base64Set.substr(0, 1));
                var secondPart = lookup.indexOf(base64Set.substr(1, 1));

                var integer = (firstPart * 64) + secondPart;

                var hexString = integer.toString(16);

                if (hexString.length == 1) {
                    hexString = "00" + hexString;
                }
                else if (hexString.length == 2) {
                    hexString = "0" + hexString;
                }
                else if (hexString.length == 0) {
                    hexString = "000";
                }

                // The last piece is only 2 characters long.
                if (curIndex == lastIndex) {
                    hexString = hexString.substr(1);
                }

                return hexString.toLowerCase();
            });

            var hexString = base16Duples.join("");

            hexString = [hexString.substr(0, 8), hexString.substr(8, 4), hexString.substr(12, 4), hexString.substr(16, 4), hexString.substr(20, 12)].join("-");

            return hexString;
        },

        testCompressUUID: function () {
            var testUUID = function (UUID) {
                if (!UUID) {
                    UUID = LABKEY.Utils.generateUUID();
                }

                return ( UUID == returnObj.uncompressUUID(returnObj.compressUUID(UUID)) );
            };

            for (var i = 0; i < 100; i++) {
                if (!testUUID()) {
                    return false;
                }
            }

            if (!testUUID("00000000-0000-0000-0000-000000000000")) { return false; }
            if (!testUUID("ffffffff-ffff-ffff-ffff-ffffffffffff")) { return false; }

            return true;
        }
    }
}