var express = require('express');
var router = express.Router();
const auth = require('./../middleware/auth');
const multer = require('multer');
const path = require('path');
const PerfilController = require('./../controllers/PerfilController');
const HomeController = require('./../controllers/HomeController');

//CARREGAR IMAGENS DE POST
//--------------------------------------------
var postImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('public','img','posts-img'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

var uploadPostImg = multer({ storage: postImg });
//---------------------------------------------
//CARREGAR IMAGENS DE PERFIL --CAPA E AVATAR
//--------------------------------------------
var profileImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('public', 'img', 'profile-img'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

var uploadProfileImg = multer({ storage: profileImg });
//---------------------------------------------


/* GET home page. */
router.get('/home', HomeController.exibir);

/* GET perfil usuario id page. */
router.get('/perfil-usuario/:id?', function (req, res, next) {
  res.render('perfil-usuario', { title: 'Usuário' });
});

/* GET perfil page. */
router.get('/perfil', PerfilController.exibir);

//Salvar o perfil do usuário
router.post('/perfil', uploadProfileImg.any(), PerfilController.salvar);

/* GET pesquisas page. */
router.get('/pesquisas', function (req, res, next) {
  res.render('pesquisas', { title: 'Pesquisa' });
});


/* GET ranking alunos page. */
router.get('/ranking-alunos', function (req, res, next) {
  res.render('ranking-alunos', { title: 'Ranking' });
});

/* GET ranking professores page. */
router.get('/ranking-professores', function (req, res, next) {
  res.render('ranking-professores', { title: 'Ranking' });
});

/* GET apoiados/apoiando page. */
router.get('/apoio', function (req, res, next) {
  res.render('apoio', { title: 'Apoio' });
});

router.get('/apoiadores', function (req, res, next) {
  res.render('apoiadores', { title: 'Apoiadores' });
});

/* GET notificacoes page. */
router.get('/notificacoes', function (req, res, next) {
  res.render('notificacoes', { title: 'Últimas notificações' });
});

/* GET mensagens page. */
router.get('/mensagens', function (req, res, next) {
  res.render('mensagens', { title: 'Últimas Mensagens' });
});

/* SAIR do sistema */
router.get('/sair', function (req, res, next) {
  auth.sair(req, res, next);
});

//Postar aprender
router.post('/postar-aprender', uploadPostImg.any(), function (req, res) {
  console.log(req.body);
});

module.exports = router;
