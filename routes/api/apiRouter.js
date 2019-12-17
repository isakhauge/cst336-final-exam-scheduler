const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const timeRouter = require('./time');

router.use('/user', userRouter);
router.use('/time', timeRouter);

module.exports = router;