let { Perfil, Cidade,
  CanalEnsino, InstituicaoEnsino,
  Curso, Postagem, Comentario,
  CategoriaPostagem, Mensagem,
  Apoio, AulaMinistrada } = require('./../models');
  const moment = require('moment');
  const sequelize = require('sequelize');
  const Op = sequelize.Op;
  
  module.exports = {
    exibirRankingProfessores: async (req, res) => {
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
              apoiador_id: id
            },
            attributes: ['apoiado_id']
          });
          
          
          if (idsApoiados != '') {
            let ids = [];
            
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
            }
            
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
            SELECT usuario_id, perfil.nome, perfil.avatar, SUM(duracao_minutos) AS minutos_ensino
            FROM aulas_ministradas aula
            INNER JOIN perfis perfil ON perfil.id = aula.usuario_id
            WHERE data_hora BETWEEN '${ONEMONTH_AGO}' AND '${TODAY}'
            GROUP BY usuario_id
            LIMIT 21
            `);
            
            //res.send(ranking[0]);
            res.render('ranking-professores', { title: 'Ranking', perfil, postagens, moment, mensagens, apoiadores, apoiados, aulas, ranking: ranking[0] });
          } catch (error) {
            console.log(error.message);
          }
        },
        
        exibirRankingAlunos: async (req, res) => {
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
                  apoiador_id: id
                },
                attributes: ['apoiado_id']
              });
              
              
              if (idsApoiados != '') {
                let ids = [];
                
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
                }
                
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
                SELECT aluno_id, perfil.nome, perfil.avatar, SUM(duracao_minutos) AS minutos_ensino
                FROM aulas_ministradas aula
                INNER JOIN perfis perfil ON perfil.id = aula.aluno_id
                WHERE data_hora BETWEEN '${ONEMONTH_AGO}' AND '${TODAY}'
                GROUP BY usuario_id
                LIMIT 21
                `);
                
                //res.send(ranking[0]);
                res.render('ranking-alunos', { title: 'Ranking', perfil, postagens, moment, mensagens, apoiadores, apoiados, aulas, ranking: ranking[0] });
              } catch (error) {
                console.log(error.message);
              }
            },
          };