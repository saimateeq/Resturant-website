import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';
import BlogPost from '../models/BlogPost.js';

// One-off repair for placeholder image URLs seeded before seedMenu.js
// URL-encoded the `lock` query param. Any name/title containing a colon,
// ampersand, or other reserved character broke the request outright (e.g.
// "Behind the Scenes: Meet Our Head Chef" 404'd). This rebuilds each URL's
// `lock` value from the document's own name/title with proper encoding,
// keeping the same keyword (and thus the same locked placeholder image).

const LOREMFLICKR_RE = /^(https:\/\/loremflickr\.com\/\d+\/\d+\/[^?]+)\?lock=(.*)$/;

function rebuildUrl(url, lockValue) {
  const match = url?.match(LOREMFLICKR_RE);
  if (!match) return null;
  const encoded = encodeURIComponent(lockValue);
  const rebuilt = `${match[1]}?lock=${encoded}`;
  return rebuilt !== url ? rebuilt : null;
}

async function run() {
  await connectDB();
  let fixed = 0;

  const categories = await Category.find({});
  for (const cat of categories) {
    const next = rebuildUrl(cat.image?.url, `cat-${cat.name}`);
    if (next) {
      cat.image.url = next;
      await cat.save();
      console.log(`Fixed category image: ${cat.name}`);
      fixed++;
    }
  }

  const dishes = await Dish.find({});
  for (const dish of dishes) {
    let changed = false;
    for (const image of dish.images || []) {
      const next = rebuildUrl(image.url, dish.name);
      if (next) {
        image.url = next;
        changed = true;
      }
    }
    if (changed) {
      await dish.save();
      console.log(`Fixed dish image(s): ${dish.name}`);
      fixed++;
    }
  }

  const posts = await BlogPost.find({});
  for (const post of posts) {
    const next = rebuildUrl(post.coverImage?.url, post.title);
    if (next) {
      post.coverImage.url = next;
      await post.save();
      console.log(`Fixed blog post cover image: ${post.title}`);
      fixed++;
    }
  }

  console.log(`Done. Fixed ${fixed} document(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Fix failed:', err);
  process.exit(1);
});
