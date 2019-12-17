"use strict";
var mysql = require('../mysql/MySQL');
var mysqlCredentials = require('../mysql/MysqlCredentials');
var bcrypt = require('bcrypt');
var db = mysql.getInstance(new mysqlCredentials(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME));
/**
 * Gate Keeper
 * @author Isak Hauge
 */
var GateKeeper = /** @class */ (function () {
    function GateKeeper() {
    }
    GateKeeper.inspect = function (req) {
        return new Promise(function (resolve, reject) {
            if (req.session.userId !== null && req.session.userId > 0)
                resolve(true);
            else
                reject(false);
        });
    };
    GateKeeper.unlock = function (email, password, req) {
        return new Promise(function (resolve, reject) {
            GateKeeper.getUser(email, function (result) {
                if (!result)
                    reject({ gateKeeper: 'Something went wrong.' });
                else {
                    if (Array.isArray(result) && result.length > 0) {
                        var currentPassword = result[0]['password'];
                        bcrypt.compare(password, currentPassword).then(function (match) {
                            if (match) {
                                req.session.userId = parseInt(result[0]['ID']);
                                resolve({ gateKeeper: 'Unlocked!' });
                            }
                            else {
                                req.session.userId = null;
                                reject({ gateKeeper: 'Unlock unsuccessful.' });
                            }
                        }).then(function (error) {
                            console.error(error);
                            reject({ gateKeeper: 'Something went wrong during password comparison.' });
                        });
                    }
                    else
                        reject({ gateKeeper: 'User does not exist.' });
                }
            });
        });
    };
    GateKeeper.getUser = function (email, callback) {
        var sql = 'SELECT * FROM `User` WHERE `email` = ?;';
        db.prep(sql, [email]).then(function (resolved) {
            callback(resolved);
        }).catch(function (error) {
            console.log(error);
            callback(false);
        });
    };
    return GateKeeper;
}());
module.exports = GateKeeper;
