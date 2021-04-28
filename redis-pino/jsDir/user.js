"use strict";
var user = /** @class */ (function () {
    function user(name) {
        this.name = name;
    }
    user.prototype.changeName = function (newName) {
        this.name = newName;
    };
    user.prototype.cal = function (n1, n2) {
        return n1 * n2;
    };
    return user;
}());
module.exports = user;
