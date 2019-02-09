const Sequelize = require('sequelize');
const { mysql } = require('./config');

const sequelize = new Sequelize(mysql.database, mysql.username, mysql.password, {
    host: mysql.host,
    dialect: 'mysql',
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: false
    }
});

const Users = sequelize.define('users', {
    login_provider: Sequelize.STRING,
    login_provider_id: Sequelize.STRING,
});

const Categories = sequelize.define('categories', {
    category_name: Sequelize.STRING
});

const Images = sequelize.define('images', {
    category_id: { type: Sequelize.INTEGER, unique: true, allowNull: false },
    image_url: Sequelize.STRING(1000),
    image_title: Sequelize.STRING(255),
    image_date: Sequelize.DATE,
    image_location: Sequelize.STRING(255),
    image_note: Sequelize.STRING(1000),
    unique_id: Sequelize.STRING(255)
});

Categories.hasMany(Images, {foreignKey: 'category_id'});
Images.belongsTo(Categories, {foreignKey: 'category_id'});

sequelize.authenticate().then(() => {
    console.log('Connection has been established.');
}).catch(err => {
    console.error('Unable to establish connection:', err);
});


module.exports = {
    sequelize: sequelize,
    Users,
    Categories,
    Images
};