import app from '../src/app';
import mongoose from 'mongoose';
import config from '../src/config';

let isConnected = false;

export default async (req: any, res: any) => {
  if (!isConnected) {
    try {
      await mongoose.connect(config.database_url as string);
      isConnected = true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  return app(req, res);
};
