const { InstituicaoEnsino } = require('./../models');


module.exports = {
  //-------------------------------------------------------------------------
  //Listar faculdades 
  //http://localhost:3000/teste/faculdades
  listar: async (req, res, next) => {
    try {
      let faculdades = await InstituicaoEnsino.findAll({
        limit: 10
      });
      res.send(faculdades);
    } catch (error) {
      console.log(error);
    }
  },
  //-------------------------------------------------------------------------
  atualizar: async (req, res)=>{
    
    let{
      descricao
    }=req.body;
    
    try {
      let result = InstituicaoEnsino.update()
    } catch (error) {
      console.log(error);
    }
  }
  
};