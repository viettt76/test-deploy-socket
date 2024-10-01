require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: ['backend/src/entity/*.js'],
  migrations: ['backend/src/migration/*.js'],
  subscribers: [],
  cli: {
    migrationsDir: 'backend/src/migration',
  },
});

module.exports = { AppDataSource };
