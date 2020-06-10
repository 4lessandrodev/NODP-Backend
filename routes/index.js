var express = require('express');
var router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { check, validationResult } = require('express-validator');


/* GET home page. */
router.get('/', function (req, res, next) {
  const LOGADO = req.session.USER != undefined;
  if (LOGADO) {
    res.redirect('/users/home');
    return;
  } else {
    next();
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  const LOGADO = req.session.USER != undefined;
  if (LOGADO) {
    res.redirect('/users/home');
    return;
  } else {
    next();
  } 
});

router.get('/', function (req, res, next) {
  res.render('entrar', { title: 'Login', errors: false });
});

/* GET index page. */
router.get('/index', function (req, res, next) {
  res.render('entrar', { title: 'Login', errors: false });
});

/* GET index page. */
router.get('/login', function (req, res, next) {
  res.render('entrar', { title: 'Login', errors: false });
});

// Realizar o login 
router.post('/login', [
  check('email', 'Email ou senha inválido').isEmail(),
  check('senha', 'Email ou senha inválido').isLength({ min: 6 })
], UsuarioController.login);


// Realizar o cadastro 
router.post('/cadastro', [
  check('email', 'Informe um email válido').isEmail(),
  check('senha', 'Senha deve conter 6 caractéres').isLength({ min: 6 })
], UsuarioController.salvar);

router.get('/cadastro', function (req, res, next) {
  res.render('cadastro', { title: 'Cadastro', errors:false });
});

module.exports = router;
