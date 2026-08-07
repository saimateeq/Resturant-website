import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Dish from '../models/Dish.js';

// One-off repair: "Zinger Burger" was created through the live admin panel
// before image upload was required (see the validation added to Dish.js and
// MenuManagement.jsx), so it ended up with an empty `images` array and a
// blank card on the menu page. Gives it the same style of placeholder image
// every other dish uses, properly URL-encoded.

async function run() {
  await connectDB();

  const dish = await Dish.findOne({ name: 'Zinger Burger' });
  if (!dish) {
    console.log('No dish named "Zinger Burger" found — nothing to fix.');
  } else if (dish.images?.length) {
    console.log('"Zinger Burger" already has an image — nothing to fix.');
  } else {
    dish.images = [
      {
        url: `https://loremflickr.com/800/600/burger,fastfood?lock=${encodeURIComponent(dish.name)}`,
        publicId: '',
      },
    ];
    await dish.save();
    console.log('Fixed image for "Zinger Burger".');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Fix failed:', err);
  process.exit(1);
});
