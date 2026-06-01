const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../config.env') });

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const DB = process.env.DB.replace('<PASSWORD>', process.env.PASSWORD);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
  try {
    await mongoose.connect(DB);
    console.log('DB connected');

    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Collections cleared');

    // Tour.create() will cast all string _id values to ObjectId
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });

    console.log('✅ Data imported successfully with proper ObjectId _id values');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

importData();
