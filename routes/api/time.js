const express = require('express');
const router = express.Router();

const mysql = require('../../res/js/class/mysql/MySQL');
const mysqlCredentials = require('../../res/js/class/mysql/MysqlCredentials');
const db = mysql.getInstance(new mysqlCredentials(
	process.env.DB_HOST,
	process.env.DB_USER,
	process.env.DB_PASS,
	process.env.DB_NAME
));

// * Get all time slots
router.get('/', (req, res) => {
	const sql = 'SELECT * FROM `Time`;';
	db.query(sql).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Get time slots for a specific user.
router.get('/user', (req, res) => {
	let sql = 'SELECT' +
		' T.`ID`,' +
		' T.`date`,' +
		' T.`start`,' +
		' T.`end`,' +
		' (SELECT `User`.`name` FROM `User`, `Time` WHERE `User`.`ID` = `Time`.`booked_by`) AS `booked_by`,' +
		' (SELECT `User`.`name` FROM `User` WHERE `User`.`ID` = ?) AS `created_by`' +
		' FROM' +
		' `Time` AS T,' +
		' `User` AS U' +
		' WHERE' +
		' T.`created_by` = U.`ID`' +
		' AND T.`created_by` = ?;';
	const id = req.session.userId;
	db.prep(sql, [id,id]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Get all bookable
router.get('/bookable', (req, res) => {
	let sql = 'SELECT' +
		' T.`ID`,' +
		' T.`date`,' +
		' T.`start`,' +
		' T.`end`,' +
		' (SELECT `User`.`name` FROM `User`, `Time` WHERE `User`.`ID` = `Time`.`booked_by`) AS `booked_by`,' +
		' U.`name` AS `created_by`' +
		' FROM' +
		' `Time` AS T,' +
		' `User` AS U' +
		' WHERE' +
		' T.`created_by` = U.`ID`' +
		' AND T.`created_by` != ?' +
		' AND DATE(T.`date`) >= NOW();';
	const id = req.session.userId;
	db.prep(sql, [id]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Book time
router.post('/book', (req, res) => {
	const {
		timeId
	} = req.body;
	const sql = 'INSERT INTO `Booking` (`time_ID`, `user_ID`) VALUES (?,?);';
	db.prep(sql, [timeId, req.session.userId]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Get a specific time slot
router.get('/:id', (req, res) => {
	const sql = 'SELECT * FROM `Time` WHERE `ID` = ?;';
	db.prep(sql, [req.params.id]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Create a time slot
router.post('/', (req, res) => {
	const {
		date,
		startTime,
		endTime
	} = req.body;
	const sql = 'INSERT INTO `Time` (`date`, `start`, `end`, `created_by`) VALUES (DATE(?), ?, ?, ?);';
	db.prep(sql, [date, startTime, endTime, req.session.userId]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


// * Delete specific
router.delete('/:id', (req, res) => {
	const sql = 'DELETE FROM `Time` WHERE `ID` = ?;';
	db.prep(sql, [req.params.id]).then((resolved) => {
		res.json(resolved);
	}).catch((error) => {
		res.json(error);
	});
});


module.exports = router;