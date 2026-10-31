import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';
  if (uri.endsWith('/')) {
    uri = `${uri}ai_mystery_room?retryWrites=true&w=majority`;
  }
  try {
    console.log(`[Database] Attempting connection to MongoDB...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] Connected to MongoDB Atlas successfully (DB: ${mongoose.connection.name}).`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection failed: ${error.message}`);
    console.warn('[Database] Activated In-Memory Session Storage. All features will work seamlessly without local MongoDB setup.');
  }
};

export const isDbConnected = () => isConnected;

