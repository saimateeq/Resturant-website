import dns from 'dns';
import mongoose from 'mongoose';

// The OS's IPv6 DNS servers are unreachable on this network and Node's
// resolver (used for mongodb+srv:// SRV lookups) tries them first,
// causing `querySrv ECONNREFUSED`. Force known-good resolvers instead.
dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });

  return conn;
}
