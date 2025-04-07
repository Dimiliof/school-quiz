const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Default to MongoDB Atlas URI if local MongoDB is not available
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://school_quiz_user:YNSgVdmb61RlRNj1@cluster0.mongodb.net/school_quiz?retryWrites=true&w=majority";
    
    // Set strictQuery to false to suppress deprecation warning
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 