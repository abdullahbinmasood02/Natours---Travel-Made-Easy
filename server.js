const dotenv = require('dotenv');

const mongoose = require('mongoose');

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err.name, err.message, err.stack);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const DB = process.env.DB.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log('DB CONNECTION SUCCESSFUL'));

const app = require('./app');

const port = process.env.PORT || 3000;
// 5. START SERVER
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
