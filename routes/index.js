const express = require('express');
const router = express.Router();
const GateKeeper = require('../res/js/class/gatekeeper/GateKeeper');

const apiRouter = require('./api/apiRouter');

router.get('/', function(req, res) {
  if (req.session.userId != null)
    res.redirect('/dashboard');
  else res.redirect('/login');
});

router.get('/login', (req, res) => {
  console.log(req.session);
  res.render('page/login', {
    title: 'Login'
  });
});

router.get('/logout', (req, res) => {
  req.session.userId = null;
  res.redirect('/login');
});

router.get('/register', (req, res) => {
  res.render('page/register', {
    title: 'register'
  });
});

router.get('/dashboard', (req, res) => {
  console.log(req.session);
  GateKeeper.inspect(req).then((result) => {
    res.render('page/dashboard', {
      title: 'Scheduler: Dashboard',
      isLoggedIn: result
    });
  }).catch((error) => {
    console.error(error);
    res.redirect('/login');
  });
});

router.get('/book', (req, res) => {
  console.log(req.session);
  GateKeeper.inspect(req).then((result) => {
    res.render('page/book', {
      title: 'Scheduler: Book',
      isLoggedIn: result
    });
  }).catch((error) => {
    console.error(error);
    res.redirect('/login');
  });
});

router.use('/api', apiRouter);

module.exports = router;
