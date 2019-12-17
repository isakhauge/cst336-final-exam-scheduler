const mysql = require('../mysql/MySQL');
const mysqlCredentials = require('../mysql/MysqlCredentials');
const bcrypt = require('bcrypt');

const db = mysql.getInstance(new mysqlCredentials(
	process.env.DB_HOST,
	process.env.DB_USER,
	process.env.DB_PASS,
	process.env.DB_NAME
));


/**
 * Gate Keeper
 * @author Isak Hauge
 */
class GateKeeper {

	public static inspect(req: any): Promise<any> {
		return new Promise((resolve, reject) => {
			if (req.session.userId !== null && req.session.userId > 0)
				resolve(true);
			else reject(false);
		});
	}

	public static unlock(email: string, password: string, req: any): Promise<any> {
		return new Promise((resolve, reject) => {
			GateKeeper.getUser(email, (result: any) => {
				if (!result)
					reject({gateKeeper: 'Something went wrong.'});
				else {
					if (Array.isArray(result) && result.length > 0) {
						const currentPassword: string = result[0]['password'];
						bcrypt.compare(password, currentPassword).then((match: any) => {
							if (match) {
								req.session.userId = parseInt(result[0]['ID']);
								resolve({gateKeeper: 'Unlocked!'});
							} else {
								req.session.userId = null;
								reject({gateKeeper: 'Unlock unsuccessful.'});
							}
						}).then((error: any) => {
							console.error(error);
							reject({gateKeeper: 'Something went wrong during password comparison.'});
						});
					} else reject({gateKeeper: 'User does not exist.'});
				}
			});
		});
	}

	private static getUser(email: string, callback: Function) {
		const sql = 'SELECT * FROM `User` WHERE `email` = ?;';
		db.prep(sql, [email]).then((resolved: any) => {
			callback(resolved);
		}).catch((error: any) => {
			console.log(error);
			callback(false);
		});
	}
}

module.exports = GateKeeper;