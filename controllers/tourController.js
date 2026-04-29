const fs = require('fs');

// CONFIGS
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.checkTourId = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  next();
};

exports.checkBody = (req, res, next) => {
  const body = req.body;
  if (body.name && body.price >= 0) {
    next();
  } else {
    return res.status(400).json({
      status: 'failed',
      message: 'invalid request body (name or price missing)',
    });
  }
};

// HANDLERS

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
  console.log('request time', req.requestTime);
};

exports.postTour = (req, res) => {
  const newId = tours.at(-1).id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours, null, 2),
    (err) => {
      res.status(201).send({ status: 'success', data: { newTour } });
      console.log('recieved');
    },
  );
};

exports.getTourById = (req, res) => {
  console.log(req.params);

  tour = tours.find((tour) => tour.id === Number(req.params.id));

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.updateTourById = (req, res) => {
  const newId = tours[req.params.id].id;
  newTours = tours.map((tour) =>
    tour.id === Number(req.params.id)
      ? Object.assign({ id: newId }, req.body)
      : tour,
  );

  res.status(201).json({
    status: 201,
    data: {
      newTours,
    },
  });
};

exports.deleteTourById = (req, res) => {
  newTours = tours.filter((tour) => tour.id != req.params.id);
  console.log(newTours);

  res.status(201).json({
    status: 201,
    data: null,
  });
};
