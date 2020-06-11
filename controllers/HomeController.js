let { Perfil, Cidade,
  CanalEnsino, InstituicaoEnsino,
  Curso, Postagem, Comentario,
  CategoriaPostagem, Mensagem,
  Apoio, AulaMinistrada, Notificacao } = require('./../models');
  const moment = require('moment');
  const sequelize = require('sequelize');
  const Op = sequelize.Op;
  
  module.exports = {
    exibir: async (req, res) => {
      let id = req.session.USER.id;
      let postagens = [];
      try {
        const perfil = await Perfil.findOne(
          {
            where: { id },
            include: [
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
                require: true
              }
            ]
          });
          
          //Descobrir quem são os apoiados do usuario logado
          let idsApoiados = await Apoio.findAll({
            where: {
              apoiador_id:id
            },
            attributes:['apoiado_id']
          });
          
          
          //if (idsApoiados != '') {
            let ids = [id];
            
            for (let id of idsApoiados) {
              ids.push(id.apoiado_id);
            }
            
            //Listar as postagens dos apoiados 
            postagens = await Postagem.findAll({
              where: {
                usuario_id: { [Op.in]: ids }
              },
              limit: 10,
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
                  require: true,
                  attributes: ['id', 'nome', 'avatar'],
                  include: [
                    {
                      model: Curso,
                      as: 'curso',
                      require: true
                    }]
                  },
                  {
                    model: CategoriaPostagem,
                    as: 'categoria',
                    require: true
                  }
                ],
                order: sequelize.literal('id DESC'),
              });
           // }
            
            const aulas = await AulaMinistrada.findAll({
              where: { usuario_id: id },
              limit: 3,
              include: [
                {
                  model: Perfil,
                  as: 'perfil_aluno',
                  required: true,
                  attributes: ['nome', 'avatar'],
                }
              ]
            });
            
            
            let mensagens = await Mensagem.findAll({
              where: {
                destinatario_id: id
              },
              limit: 3,
              include: [ 
                {
                  model: Perfil,
                  as: 'perfil_msg',
                  required: true,
                  attributes: ['id', 'nome', 'avatar'],
                }
              ],
              order: sequelize.literal('id DESC'),
              group: ['usuario_id'],
            });
            
            let apoiadores = await Apoio.findAll({
              where: {
                apoiado_id: id
              },
              limit: 4,
              include: [
                {
                  model: Perfil,
                  as: 'apoiador',
                  required: true,
                  attributes: ['id', 'nome', 'avatar'],
                  include: [
                    {
                      model: Curso,
                      as: 'curso',
                      required: true,
                      attributes: ['descricao'],
                    }
                  ]
                }
              ],
              order: sequelize.literal('id DESC'),
            });
            
            let apoiados = await Apoio.findAll({
              where: {
                apoiador_id: id
              },
              limit: 5,
              include: [
                {
                  model: Perfil,
                  as: 'apoiado',
                  required: true,
                  attributes: ['id', 'nome', 'avatar'],
                  include: [
                    {
                      model: Curso,
                      as: 'curso',
                      required: true,
                      attributes: ['descricao'],
                    }
                  ]
                }
              ],
              order: sequelize.literal('id DESC'),
            });
            
            const TODAY = moment().add('1', 'day').format('YYYY-MM-DD hh:mm:ss');
            const ONEMONTH_AGO = moment().subtract('30', 'days').format('YYYY-MM-DD hh:mm:ss');
            
            let ranking = await AulaMinistrada.sequelize.query(`
            SELECT usuario_id, SUM(duracao_minutos) AS minutos_ensino
            FROM aulas_ministradas aula
            INNER JOIN perfis perfil ON perfil.id = aula.usuario_id
            WHERE data_hora BETWEEN '${ONEMONTH_AGO}' AND '${TODAY}'
            GROUP BY usuario_id
            LIMIT 21
            `);
            
            let posicaoPerfil=0;
            //Encontrar a posicao no ranking do perfil logado
            ranking[0].forEach((element, i) => {
              let stop = 0;
              if (element.usuario_id == id) {
                posicaoPerfil = i + 1;
                stop = 1;
              } else if(stop==0){
                posicaoPerfil = '+'+(i + 2);
              }
            });
            
            
            let { count:notificacoes } = await Notificacao.findAndCountAll({
              where: {
                usuario_id: req.session.USER.id,
                lida:0
              }
            });
        
        
           // res.send(postagens);
          res.render('home', { title: 'Home', perfil, postagens, moment, mensagens, apoiadores, apoiados, aulas, posicaoPerfil, notificacoes });
          }catch (error) {
            console.log(error.message);
          }
        },
      };