import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const accounts = [
  {
    name: 'Admin User',
    email: 'admin@savoria.com',
    password: 'Admin@12345',
    role: 'admin',
    phone: '+1 555-0100',
    isEmailVerified: true,
  },
  {
    name: 'Test Customer',
    email: 'customer@savoria.com',
    password: 'Customer@12345',
    role: 'customer',
    phone: '+1 555-0200',
    isEmailVerified: true,
  },
];

async function seed() {
  await connectDB();

  for (const account of accounts) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      existing.name = account.name;
      existing.role = account.role;
      existing.phone = account.phone;
      existing.isEmailVerified = true;
      existing.isBlocked = false;
      existing.password = account.password;
      await existing.save();
      console.log(`Updated existing account: ${account.email} (role=${account.role})`);
    } else {
      await User.create(account);
      console.log(`Created account: ${account.email} (role=${account.role})`);
    }
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
