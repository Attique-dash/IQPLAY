import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI || '';

if (!MONGODB_URI){
  throw new Error('MONGODB_URI is not defined in env')
}

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected){
    console.log('Database is already connected');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Database is Connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

export default connectToDatabase;