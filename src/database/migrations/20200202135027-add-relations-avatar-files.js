module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('couriers', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'files',
        key: 'id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
    });
  },

  down(queryInterface) {
    return queryInterface.removeColumn('couriers', 'avatar_id');
  },
};
