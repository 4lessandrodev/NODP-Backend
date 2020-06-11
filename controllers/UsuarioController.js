const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const auth = require('./../middleware/auth');
const {
  Usuario, Perfil, Cidade, CanalEnsino, InstituicaoEnsino, Curso
} = require('./../models');


module.exports = {
  //-------------------------------------------------------------------------
  //Listar Usuarios e seu respectivo perfil : GET
  //http://localhost:3000/teste/usuarios
  listar: async (req, res) => {
    //let { user } = req.session;
    try {
      const users = await Usuario.findAll({
        attributes: ['id', 'email'],
        include: [
          {
            //attributes: ['nome', 'avatar'],
            model: Perfil,
            as: 'perfil',
            required: true,
          }
        ]
      });
      res.send(users);
    } catch (error) {
      console.log(error);
    }
  },
  
  //-------------------------------------------------------------------------
  //Salvar novo usuario (email e senha) : POST > body = email, senha
  //http://localhost:3000/teste/salvar-usuario
  salvar: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      let perfil = {};

      if (!errors.isEmpty()) {
        res.render('cadastro', { title: 'Cadastro', errors: errors.array() });
      }


      let { email, senha } = req.body;

      let user = {
        email: email,
        senha: bcrypt.hashSync(senha, 10)
      };

      let usuarioExiste = await Usuario.findOne({ where: { email } });

      if (usuarioExiste != null) {
        res.render('cadastro', { title: 'Cadastro', errors: [{ msg: 'Email já cadastrado' }] });
      }

      const savedUser = await Usuario.create(user);

      //Criar um perfil para o usuário 
      perfil.cidade_id = 1;
      perfil.id = savedUser.id;
      perfil.nome = 'Anônimo';
      perfil.curso_id = 1;
      perfil.bio = 'Meu objetivo é...';
      perfil.celular = '(00) ...';
      perfil.quantidade_moedas = 1;
      perfil.instituicao_ensino_id = 1;
      perfil.turma = 2020;
      perfil.metodo_ensino_id = 1;
      perfil.metodo_aprendizado_id = 1;
      perfil.qtd_moedas = 10;

      let result = await Perfil.create(perfil);

      //Salvar usuario na sessao e local e direciona para a pagina inicial
      auth.salvarSessao(req, res, next, savedUser);

    }
    catch (error) {
      console.log(error);
    }
  },
  
  //-------------------------------------------------------------------------
  //Editar(trocar a senha) : PUT > body = senha
  //http://localhost:3000/teste/usuario
  editar: async (req, res) => {
    let {
      email,
      senha
    } = req.body;
    senha = bcrypt.hashSync(senha, 10);
    try {
      const editar = await Usuario.update(
        { senha: senha },
        { where: { email: email } }
        );
        res.send("Sua senha foi alterada com sucesso");
      } catch (error) {
        res.send("erro");
        console.log(error.message);
      }
    },
    //-------------------------------------------------------------------------
    //Excluir um usuário pelo id : DELETE > body > id
    //http://localhost:3000/teste/usuario
    excluir: async (req, res) => {
      let { id } = req.body;
      try {
        Usuario.update(
          { ativo: '0' },
          { where: { id } }
          );
          res.send("Usuário excluido com sucesso!");
        } catch (error) {
          res.send('Não foi possível excluir');
        }
      },
      

        //-------------------------------------------------------------------------
        //http://localhost:3000/login : POST > body = email, senha
        login: async (req, res, next) => {
          try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              res.render('entrar', { title: 'Entrar', errors: errors.array()});
            }

            let { email, senha } = req.body;
            let usuarioPesquisado = await Usuario.findOne({
              where: {
                email
              }
            });
            
            //Verificar se a senha é válida
            let senhaIguais = await bcrypt.compareSync(senha, usuarioPesquisado.senha);
            if (!senhaIguais) {
              res.render('entrar', { title: 'Entrar', errors: [{ param: 'email', msg: 'Email ou senha inválida' }] });
              return;
            }

            //Salvar usuario na sessao e local e direcionar para a pagina inicial
            auth.salvarSessao(req, res, next, usuarioPesquisado);

          } catch (error) {
            console.log(error);
            res.render('entrar', { title: 'Entrar', errors: [{ param: 'email', msg: 'Email ou senha inválida' }] });
            return;
          }
          
        },
        
      };
      