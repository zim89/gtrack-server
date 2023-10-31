const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    const db = await mongoose.connect(process.env.DB_HOST);
    console.log(
      `🌐 Database is connected. Name: ${db.connection.name}. Host: ${db.connection.host}. Port: ${db.connection.port}`
    );
  } catch (err) {
    console.log('❌ Error in DB connection: ' + err);
    process.exit(1);
  }
};

module.exports = connectDb;
