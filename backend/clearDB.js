const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

// Load models
const Ride = require("./models/Ride");
const User = require("./models/userModel");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const clearData = async () => {
  try {
    await connectDB();

    console.log("Emptying collections...");
    await Ride.deleteMany({});
    await User.deleteMany({});

    console.log("All records deleted successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error deleting records: ${error.message}`);
    process.exit(1);
  }
};

clearData();
