let { Perfil,
  Cidade,
  CanalEnsino,
  InstituicaoEnsino,
  Curso, Interesse,
  Postagem, Comentario,
  CategoriaPostagem,
  Mensagem, Apoio,
  Usuario,
  AulaMinistrada,
  Notificacao
} = require('./../models');
const moment = require('moment');
const sequelize = require('sequelize');

module.exports = {
  
  salvar: async (req, res, next) => {
    let perfil = {};
    let id = req.session.USER.id;
    let {
      cidade_id,
      nome,
      curso_id, 
      bio, 
      celular, 
      quantidade_moedas, 
      instituicao_ensino_id, 
      turma, 
      metodo_ensino_id, 
      metodo_aprendizado_id, 
    } = req.body;
    let { files } = req;
    
    perfil.cidade_id = parseInt(cidade_id);
    perfil.id = id;
    perfil.nome = nome;
    perfil.curso_id = curso_id;
    perfil.bio = bio;
    perfil.celular = celular;
    perfil.quantidade_moedas = quantidade_moedas;
    perfil.instituicao_ensino_id = instituicao_ensino_id;
    perfil.turma = turma;
    perfil.metodo_ensino_id = metodo_ensino_id;
    perfil.metodo_aprendizado_id = metodo_aprendizado_id;
    
    if (files) {
      for (let file of files) {
        if (file.fieldname.toUpperCase() == 'CAPA') {
          perfil.capa = file.filename;
        } else if (file.fieldname.toUpperCase() == 'AVATAR') {
          perfil.avatar = file.filename;
        }
      }
    }
    
    let result = await Perfil.update(perfil, {
      where: {
        id
      }
    });
    res.redirect('/users/perfil');
  },
  
  // --------------------------------------------------------------------------
  //Visualizar um perfil com todos os atributos : GET > query ?perfil=5
  //http://localhost:3000/teste/usuario?perfil=1
  exibir: async (req, res) => {
    let id = req.session.USER.id;
    let aulasMinistradas = [];
    let aulasAssistidas = [];
    
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
        
        let mensagens = await Mensagem.findAll({
          where: {
            destinatario_id: req.session.USER.id
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
          limit:4,
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
        
        aulasMinistradas = await AulaMinistrada.findAll({
          where: { usuario_id: id },
          limit: 3,
          include: [
            {
              model: Perfil,
              as: 'perfil_aluno',
              required: true,
              attributes: ['nome', 'avatar'],
            }
          ],
          order: sequelize.literal('id DESC'),
        });
        
        aulasAssistidas = await AulaMinistrada.findAll({
          where: { aluno_id: id },
          limit: 3,
          include: [
            {
              model: Perfil,
              as: 'perfil_professor',
              required: true,
              attributes: ['nome', 'avatar'],
            }
          ],
          order: sequelize.literal('id DESC'),
        });
        
        let { count: notificacoes } = await Notificacao.findAndCountAll({
          where: {
            usuario_id: req.session.USER.id,
            lida: 0
          }
        });
        
        let faculdades = await InstituicaoEnsino.findAll();
        let cursos = await Curso.findAll();
        let interesses = await Interesse.findAll();
        
        let interesses_aprendizado = await Interesse.sequelize.query(`
        SELECT * FROM interesses i 
        INNER JOIN usuarios_tem_interesse_aprendizado iap ON i.id = iap.interesse_id
        WHERE iap.usuario_id = ${req.session.USER.id}
        GROUP BY iap.interesse_id
        `);
        let interesses_ensino = await Interesse.sequelize.query(`
        SELECT * FROM interesses i 
        INNER JOIN usuarios_tem_interesse_ensino iap ON i.id = iap.interesse_id
        WHERE iap.usuario_id = ${req.session.USER.id}
        GROUP BY iap.interesse_id
        `);
      //res.send(interesses_aprendizado[0]);
      res.render('perfil', { title: 'Perfil', interesses_aprendizado: interesses_aprendizado[0], apoiados, interesses_ensino: interesses_ensino[0], perfil, notificacoes, faculdades, cursos, interesses, mensagens, apoiadores, aulasMinistradas, aulasAssistidas });
      }
      catch (error) {
        console.log(error.message);
      }
    },
    
    //Exibir o perfil de um usuário e suas postagens 
    exibirPerfilDeAmigo: async (req, res, next) => {
      try {
        let id = req.query.perfil;
        (!isNaN(id)) ? id = req.query.perfil : id = req.session.USER.id;
        let aulasMinistradas = [];
        let aulasAssistidas = [];
        
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
              },
              {
                model: Usuario,
                as: 'usuario',
                require: true,
                attributes: ['email'],
              }
            ]
          });
          
          let apoiadores = await Apoio.findAll({
            where: {
              apoiado_id: id
            },
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
        
        
          
          let mensagens = await Mensagem.findAll({
            where: {
              destinatario_id: req.session.USER.id
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
          
          aulasMinistradas = await AulaMinistrada.findAll({
            where: { usuario_id: id },
            limit: 3,
            include: [
              {
                model: Perfil,
                as: 'perfil_aluno',
                required: true,
                attributes: ['nome', 'avatar'],
              }
            ],
            order: sequelize.literal('id DESC'),
          });
          
          aulasAssistidas = await AulaMinistrada.findAll({
            where: { aluno_id: id },
            limit: 3,
            include: [
              {
                model: Perfil,
                as: 'perfil_professor',
                required: true,
                attributes: ['nome', 'avatar'],
              }
            ],
            order: sequelize.literal('id DESC'),
          });
          
          let { count: notificacoes } = await Notificacao.findAndCountAll({
            where: {
              usuario_id: req.session.USER.id,
              lida: 0
            }
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
        
        let interesses_aprendizado = await Interesse.sequelize.query(`
        SELECT * FROM interesses i 
        INNER JOIN usuarios_tem_interesse_aprendizado iap ON i.id = iap.interesse_id
        WHERE iap.usuario_id = ${id}
        GROUP BY iap.interesse_id
        `);
        let interesses_ensino = await Interesse.sequelize.query(`
        SELECT * FROM interesses i 
        INNER JOIN usuarios_tem_interesse_ensino iap ON i.id = iap.interesse_id
        WHERE iap.usuario_id = ${id}
        GROUP BY iap.interesse_id
        `);
          
          //res.send(perfil);
        res.render('perfil-usuario', { title: 'Usuário', apoiados, interesses_aprendizado: interesses_aprendizado[0], interesses_ensino: interesses_ensino[0], perfil, apoiadores, mensagens, aulasMinistradas, aulasAssistidas, notificacoes });
          
        } catch (error) {
          console.log(error);
        }
      },
      
      //Exibir o perfil de um usuário e suas postagens 
      exibirPostagensDeAmigo: async (req, res, next) => {
        try {
          let id = req.query.perfil;
          //localhost:3000/users/posts-usuario?perfil=1
          (!isNaN(id)) ? id = req.query.perfil : id = req.session.USER.id;
          
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
            
            //Listar as postagens 
            let postagens = await Postagem.findAll({
              where: {
                usuario_id:id
              },
              include: [
                {
                  model: Comentario,
                  as: 'comentarios',
                  required: false,
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
                  require: false,
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
                    require:true
                  }
                ],
                order: sequelize.literal('id DESC'),
                limit:10
              });
              
              let mensagens = await Mensagem.findAll({
                where: {
                  destinatario_id: req.session.USER.id
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
                group: ['usuario_id'],
              });
              
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
                ],
                order: sequelize.literal('id DESC'),
              });
              //res.send(perfil);
              //res.send(postagens);
              
              let { count: notificacoes } = await Notificacao.findAndCountAll({
                where: {
                  usuario_id: req.session.USER.id,
                  lida: 0
                }
              });
              
              res.render('home-de-um-usuario', { title: 'Usuário', perfil, postagens, moment, mensagens, aulas, notificacoes });
              
            } catch (error) {
              console.log(error);
            }
          }
          
        };