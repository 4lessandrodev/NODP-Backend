/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UsuarioTemInteresseEnsino', {
    'usuario_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      references: {
        model: 'Usuario',
        key: 'id'
      }
    },
    'interesse_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      references: {
        model: 'Interesse',
        key: 'id'
      }
    }
  }, {
      tableName: 'usuarios_tem_interesses_ensino',
      timestamps: false
  });
};