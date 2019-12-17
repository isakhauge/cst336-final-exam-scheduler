const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const GateKeeper = require('../../res/js/class/gatekeeper/GateKeeper');

const mysql = require('../../res/js/class/mysql/MySQL');
const mysqlCredentials = require('../../res/js/class/mysql/MysqlCredentials');
const db = mysql.getInstance(new mysqlCredentials(
	process.env.DB_HOST,
	process.env.DB_USER,
	process.env.DB_PASS,
	process.env.DB_NAME
));


// * Get all users
router.get('/', (req, res) => {
	const sql = 'SELECT * FROM `User`;';
	db.query(sql).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Get a specific user
router.get('/:id', (req, res) => {
	const sql = 'SELECT * FROM `User` WHERE `ID` = ?;';
	db.prep(sql, [req.params.id]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Create user
router.post('/', (req, res) => {
	const {
		name,
		email,
		password
	} = req.body;
	bcrypt.hash(password, 10).then((hash) => {
		const sql = 'INSERT INTO `User` (`email`, `password`, `name`) VALUES (?,?,?);';
		db.prep(sql, [email,hash,name]).then((resolved) => {
			res.json(resolved);
		}).catch((error) => {
			res.json(error)
		});
	}).catch((error) => {
		res.json(error);
	});
});


// * Delete user
router.delete('/:id', (req, res) => {
	const sql = 'DELETE FROM `User` WHERE `ID` = ?;';
	db.prep(sql, [req.params.id]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * User login
router.post('/login', (req, res) => {
	const {
		email,
		password
	} = req.body;
	GateKeeper.unlock(email, password, req).then((success) => {
		res.json(success);
	}).catch((error) => {
		res.json(error);
	})
});




module.exports = router;