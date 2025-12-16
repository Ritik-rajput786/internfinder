require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const u = await User.findOne({ email: 'teststudent2@example.com' }).lean();
    console.log('User:', u);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();