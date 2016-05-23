/**
 * Created by jps123 on 5/19/16.
 */

'use strict';

var moment = require("moment");

module.exports = {

    splitInWords: function (str) {
        var tmp = [];
        str.split(' ')
            .forEach(function (val) {
                if (val.trim().length !== 0) {
                    tmp.push(val);
                }
            });
        return tmp;
    },

    getDiffHrs: function (start, end) {
        return getDiffMins(start, end) / 60;
    },

    getDiffMins: getDiffMins

}

function getDiffMins(start, end) {
    return moment.duration(end.diff(start)).asMinutes();
}