const fs = require('fs');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then(() => console.log('DB CONNECTION SUCCESSFUL'));

const port = process.env.PORT || 3000;

const json_data = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'),
).map((tour) => {
  delete tour.id;
  return tour;
});

function postTour(tour) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(tour);
    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path: '/api/v1/tours',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = app.listen(port, async () => {
  console.log(`Server started on port ${port}`);
  for (const tour of json_data) {
    await postTour(tour);
    console.log(`Imported: ${tour.name}`);
  }
  console.log('All tours imported!');
  server.close(() => process.exit());
});
