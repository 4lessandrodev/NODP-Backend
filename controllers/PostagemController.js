const { Postagem, Comentario, Perfil} = require('./../models');
const sequelize = require('sequelize');

module.exports = {
  //-------------------------------------------------------------------------
  //Listar postagem
  //http://localhost:3000/teste/postagens
  listar: async (req, res, next) => {
    try {
      let postagens = await Postagem.findAll({
        include: [
          {
            model: Comentario,
            as: 'comentarios',
            required: false,
            limit: 5,
            order: sequelize.literal('id DESC'), 
            include: [
              {
                model: Perfil,
                as: 'perfil_coment',
                require: true,
                attributes: ['id', 'nome', 'avatar'],
              }
            ]
          },
          {
            model: Perfil,
            as: 'perfil',
            require:false
          }
        ],
        limit: 21,
        order: sequelize.literal('id DESC'),
      });
      res.send(postagens);
    } catch (error) {
      console.log(error);
    }
  },
  
  //-------------------------------------------------------------------------
  //salvar postagem
  //http://localhost:3000/teste/postagens
  salvar: async (req, res) => {
    try {
      post = {};
      let {
        
        categoria_id,
        titulo,
        descricao,
        
      } = req.body;
      
      
      post.categoria_id = categoria_id;
      post.titulo = titulo;
      post.descricao = descricao;
      post.usuario_id = req.session.USER.id;
      
      for (let img of req.files) {
        post.imagem = img.filename;
      }
      
      switch (categoria_id) {
        //Quero aprender
        case '3':
          post.urgente = req.body.urgente;
        break;
        //Quero ensinar
        case '4':
          post.preco_aula = parseInt(req.body.preco_aula);
          post.duracao_aula = parseInt(req.body.duracao_aula);
        break;
        default:
        break;
      }
      
      
      const salvar = await Postagem.create(post);
      res.redirect('/users/home');
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  },
  
  //-------------------------------------------------------------------------
  //editar postagem
  //http://localhost:3000/teste/postagens
  editar: async (req, res) => {
    try {
      let {
        
        id,
        categoria_id,
        titulo,
        descricao,
        imagem
        
      } = req.body;
      
      const editar = await Postagem.update({
        categoria_id,
        titulo,
        descricao,
        imagem
      }, { where: { id: id } }
      );
      res.send('Post editado');
    } catch (error) {
      console.log(error);
    }
  },
  
  //-------------------------------------------------------------------------
  //excluir postagem
  //http://localhost:3000/teste/postagens
  excluir: async (req, res) => {
    try {
      let {
        id,
      } = req.body;
      
      const editar = await Postagem.destroy({ where: { id } }
        );
        res.send('Post excluído');
      } catch (error) {
        console.log(error);
        
      }
    },
    //-------------------------------------------------------------------------
    //Listar postagens 
    listarPostagens: async (req, res) =>{
      
      try {
        let postagens = await Postagem.sequelize.query(
          `
          SELECT * 
          FROM ${Postagem.tableName} postagem
          INNER JOIN ${Perfil.tableName} perfil ON perfil.usuario_id = postagem.usuario_id
          LEFT JOIN ${Comentario.tableName} comentario ON comentario.post_id = postagem.id
          LEFT JOIN ${Perfil.tableName} usuario ON usuario.id = comentario.usuario_id
          GROUP BY postagem.id
          
          `
          
          );
          
          res.send(postagens);
          
        } catch (error) {
          
        }
        
      }
      
    };
    
    
    