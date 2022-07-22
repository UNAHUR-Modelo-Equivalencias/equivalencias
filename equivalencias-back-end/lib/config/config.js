const path = require('path');
const debug = require('debug');
const parse = require('pg-connection-string').parse;
const dotenv = require('dotenv');

function getEnvironment() {
  return 'production';
}

function initializeEnv() {
  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${getEnvironment()}`),
  });
}

function parseHerokuUrlIfPresent() {
  const url = 'postgres://ptakwrapckjkne:22f93e633f0d18873cf95bc6375aee7778107581cd2fcacbc3515f4ccedb0b69@ec2-54-161-255-125.compute-1.amazonaws.com:5432/dbktvmpppt8nt7'

  if (url === undefined) {
    return {};
  }

  const config = parse(url);

  // Heroku necesita sí o sí SSL, y para eso hay que habilitar el driver nativo.
  return {
    ...config,
    username: config.user,
    native: true,
  };
}

function normalizePort(val) {
  const portNum = parseInt(val, 10);

  if (Number.isNaN(portNum)) {
    // named pipe
    return val;
  }

  if (portNum >= 0) {
    // port number
    return portNum;
  }

  return false;
}

function initializeConfig() {
  const environment = getEnvironment();
  let dbConfig = {
    username: 'ptakwrapckjkne',
    password: '22f93e633f0d18873cf95bc6375aee7778107581cd2fcacbc3515f4ccedb0b69',
    database: 'dbktvmpppt8nt7',
    host: 'ec2-54-161-255-125.compute-1.amazonaws.com',
    port: '5432',
    dialect: 'postgres',
    logging: debug('sequelize'),
  };
  if (environment === 'development') {
    dbConfig.seederStorage = 'sequelize';
  } else if (environment === 'test') {
    dbConfig.database =
      process.env.SQL_TEST_DATABASE || process.env.SQL_DATABASE;
  } else if (environment === 'production') {
    dbConfig = { ...dbConfig, ...parseHerokuUrlIfPresent() };
  }
  return {
    db: dbConfig,
    port: normalizePort(process.env.PORT || '3001'),
  };
}

initializeEnv();

module.exports = initializeConfig();
