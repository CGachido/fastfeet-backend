module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      product: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'recipients',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: false,
        },
      },

      courier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'couriers',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: false,
        },
      },

      signature_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'files',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true,
        },
      },

      canceled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      start_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      end_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('orders');
  },
};
