import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const isPlaceholderUri = (uri) => {
  if (!uri) return true;
  return uri.includes('<db_username>') || uri.includes('<db_password>') || uri.includes('cluster0.xxxxx');
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || isPlaceholderUri(uri)) {
    console.warn('⚠️  MongoDB connection skipped because MONGO_URI is not set or still uses placeholders.');
    process.env.MONGO_CONNECTED = 'false';
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    process.env.MONGO_CONNECTED = 'true';
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 Make sure MongoDB is running locally or update MONGO_URI in .env');
    process.env.MONGO_CONNECTED = 'false';
    // Don't exit process in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
