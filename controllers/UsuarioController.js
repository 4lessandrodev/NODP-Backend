const bcrypt = require('bcrypt');
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
        include: [
          {
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
  salvar: async (req, res) => {
    try{
      let {
        email,
        senha
      } = req.body;

      let objeto = {
        email: email,
        senha: bcrypt.hashSync(senha, 10)
      };
      const criar = await Usuario.create(objeto);

      res.render('home', {title: 'Pagina inicial'});
    }
    catch(error){
      console.log(error)
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
      
      // --------------------------------------------------------------------------
      //Visualizar um perfil com todos os atributos : GET > query ?perfil=5
      //http://localhost:3000/teste/usuario?perfil=1
      perfil: async (req, res) => {
        let { perfil } = req.query;
        
        try {
          const usuario = await Perfil.findOne(
            {
              where: { usuario_id: perfil },
              include: [
                {
                  model: Usuario,
                  as: 'usuario',
                  required: true,
                },
                {
                  model: Cidade,
                  as: 'cidade',
                  required: true
                },
                {
                  model: CanalEnsino,
                  as: 'ensino',
                  required: true
                },
                {
                  model: CanalEnsino,
                  as: 'aprendizado',
                  required: true
                },
                {
                  model: InstituicaoEnsino,
                  as: 'instituicao',
                  required: true
                },
                {
                  model: Curso,
                  as: 'curso',
                  require:true
                }
              ]
            });
            
            res.send(usuario);
          }
          catch (error) {
            console.log(error.message);
            console.log(error.sql);
            
            res.send('Erro ao procurar perfil');
          }
        },
        //-------------------------------------------------------------------------
        
      };
      