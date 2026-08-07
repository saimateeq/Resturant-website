import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import BlogPost from '../models/BlogPost.js';

// `n` (a dish/category/post name) can contain spaces, colons, ampersands,
// etc. — unencoded, those broke the request outright for any name with a
// colon (e.g. "Behind the Scenes: Meet Our Head Chef" 404'd the image).
const img = (keyword, n) => ({
  url: `https://loremflickr.com/800/600/${keyword}?lock=${encodeURIComponent(n)}`,
  publicId: '',
});

const CATEGORIES = [
  { name: 'Appetizers', description: 'Start your meal right with our signature small plates.', keyword: 'appetizer,starter' },
  { name: 'Soups & Salads', description: 'Fresh, light, and packed with flavor.', keyword: 'salad,soup' },
  { name: 'Main Course', description: 'Hearty entrees crafted by our chefs.', keyword: 'dinner,entree' },
  { name: 'Pizza', description: 'Wood-fired pizzas with signature toppings.', keyword: 'pizza,food' },
  { name: 'Desserts', description: 'Sweet finishes to every meal.', keyword: 'dessert,cake' },
  { name: 'Beverages', description: 'Refreshing drinks, mocktails, and coffee.', keyword: 'drink,cocktail' },
  { name: 'Breakfast', description: 'Morning favorites served all day.', keyword: 'breakfast,food' },
  // Reuses the "Fast food" category if it already exists in the DB.
  { name: 'Fast food', description: 'Quick bites and comfort food classics.', keyword: 'burger,fastfood' },
];

const DISHES = [
  // Appetizers
  { name: 'Crispy Spring Rolls', category: 'Appetizers', description: 'Golden-fried vegetable spring rolls served with sweet chili sauce.', ingredients: ['Cabbage', 'Carrot', 'Rice paper', 'Sweet chili sauce'], price: 6.99, calories: 320, prepTimeMinutes: 12, isVegetarian: true, isVegan: true, keyword: 'springroll,appetizer' },
  { name: 'Garlic Butter Shrimp', category: 'Appetizers', description: 'Sauteed shrimp in garlic butter sauce with a hint of chili flakes.', ingredients: ['Shrimp', 'Garlic', 'Butter', 'Chili flakes', 'Parsley'], price: 9.99, calories: 280, prepTimeMinutes: 15, keyword: 'shrimp,garlic' },
  { name: 'Loaded Nachos', category: 'Appetizers', description: 'Crispy tortilla chips topped with melted cheese, jalapenos, and salsa.', ingredients: ['Tortilla chips', 'Cheddar cheese', 'Jalapenos', 'Salsa', 'Sour cream'], price: 8.49, calories: 610, prepTimeMinutes: 10, isVegetarian: true, isFeatured: true, keyword: 'nachos,cheese' },
  { name: 'Mozzarella Sticks', category: 'Appetizers', description: 'Breaded mozzarella sticks fried until golden, served with marinara.', ingredients: ['Mozzarella', 'Breadcrumbs', 'Marinara sauce'], price: 7.49, calories: 450, prepTimeMinutes: 10, isVegetarian: true, keyword: 'mozzarella,cheese' },

  // Soups & Salads
  { name: 'Caesar Salad', category: 'Soups & Salads', description: 'Crisp romaine, parmesan, croutons, and creamy Caesar dressing.', ingredients: ['Romaine lettuce', 'Parmesan', 'Croutons', 'Caesar dressing'], price: 7.99, calories: 340, prepTimeMinutes: 8, isVegetarian: true, isFeatured: true, keyword: 'caesarsalad,salad' },
  { name: 'Tomato Basil Soup', category: 'Soups & Salads', description: 'Slow-simmered tomato soup finished with fresh basil.', ingredients: ['Tomato', 'Basil', 'Vegetable stock', 'Olive oil'], price: 5.99, calories: 190, prepTimeMinutes: 10, isVegetarian: true, isVegan: true, keyword: 'tomatosoup,soup' },
  { name: 'Greek Salad', category: 'Soups & Salads', description: 'Cucumber, tomato, olives, and feta tossed in a lemon-oregano dressing.', ingredients: ['Cucumber', 'Tomato', 'Kalamata olives', 'Feta cheese', 'Red onion'], price: 8.49, calories: 310, prepTimeMinutes: 8, isVegetarian: true, keyword: 'greeksalad,feta' },
  { name: 'Chicken Noodle Soup', category: 'Soups & Salads', description: 'Classic comfort soup with shredded chicken and egg noodles.', ingredients: ['Chicken breast', 'Egg noodles', 'Carrot', 'Celery', 'Chicken stock'], price: 6.49, calories: 260, prepTimeMinutes: 15, keyword: 'chickensoup,noodle' },

  // Main Course
  { name: 'Grilled Salmon', category: 'Main Course', description: 'Atlantic salmon grilled to perfection with lemon-dill sauce.', ingredients: ['Salmon fillet', 'Lemon', 'Dill', 'Butter'], price: 18.99, calories: 520, prepTimeMinutes: 20, isFeatured: true, keyword: 'salmon,grilled' },
  { name: 'Chicken Alfredo Pasta', category: 'Main Course', description: 'Fettuccine tossed in a rich, creamy Alfredo sauce with grilled chicken.', ingredients: ['Fettuccine', 'Chicken breast', 'Parmesan', 'Heavy cream', 'Garlic'], price: 15.49, calories: 780, prepTimeMinutes: 18, keyword: 'alfredo,pasta' },
  { name: 'BBQ Ribs', category: 'Main Course', description: 'Fall-off-the-bone pork ribs glazed in smoky BBQ sauce.', ingredients: ['Pork ribs', 'BBQ sauce', 'Brown sugar', 'Paprika'], price: 19.99, calories: 890, prepTimeMinutes: 35, isFeatured: true, keyword: 'ribs,bbq' },
  { name: 'Vegetable Stir Fry', category: 'Main Course', description: 'Wok-tossed seasonal vegetables in a savory garlic-ginger sauce.', ingredients: ['Broccoli', 'Bell pepper', 'Carrot', 'Soy sauce', 'Ginger'], price: 13.49, calories: 320, prepTimeMinutes: 15, isVegetarian: true, isVegan: true, keyword: 'stirfry,vegetables' },

  // Pizza
  { name: 'Margherita Pizza', category: 'Pizza', description: 'Classic pizza with San Marzano tomato sauce, mozzarella, and basil.', ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Basil'], price: 12.99, calories: 640, prepTimeMinutes: 16, isVegetarian: true, isFeatured: true, keyword: 'margherita,pizza' },
  { name: 'Pepperoni Pizza', category: 'Pizza', description: 'Loaded with spicy pepperoni and a blend of melted cheeses.', ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Pepperoni'], price: 14.49, calories: 780, prepTimeMinutes: 16, keyword: 'pepperoni,pizza' },
  { name: 'BBQ Chicken Pizza', category: 'Pizza', description: 'Grilled chicken, red onion, and BBQ sauce on a crispy crust.', ingredients: ['Pizza dough', 'BBQ sauce', 'Chicken breast', 'Red onion', 'Mozzarella'], price: 15.99, calories: 810, prepTimeMinutes: 18, keyword: 'bbqpizza,chicken' },
  { name: 'Veggie Supreme Pizza', category: 'Pizza', description: 'Bell peppers, mushrooms, olives, and onions on a garden-fresh pizza.', ingredients: ['Pizza dough', 'Tomato sauce', 'Bell pepper', 'Mushroom', 'Olives', 'Onion'], price: 13.99, calories: 690, prepTimeMinutes: 16, isVegetarian: true, keyword: 'veggiepizza,vegetables' },

  // Desserts
  { name: 'Chocolate Lava Cake', category: 'Desserts', description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.', ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Flour', 'Vanilla ice cream'], price: 6.99, calories: 480, prepTimeMinutes: 14, isVegetarian: true, isFeatured: true, keyword: 'chocolatecake,dessert' },
  { name: 'New York Cheesecake', category: 'Desserts', description: 'Creamy classic cheesecake on a graham cracker crust.', ingredients: ['Cream cheese', 'Graham crackers', 'Sugar', 'Eggs'], price: 7.49, calories: 510, prepTimeMinutes: 5, isVegetarian: true, keyword: 'cheesecake,dessert' },
  { name: 'Tiramisu', category: 'Desserts', description: 'Layers of espresso-soaked ladyfingers and mascarpone cream.', ingredients: ['Ladyfingers', 'Mascarpone', 'Espresso', 'Cocoa powder'], price: 7.99, calories: 460, prepTimeMinutes: 5, isVegetarian: true, keyword: 'tiramisu,dessert' },
  { name: 'Ice Cream Sundae', category: 'Desserts', description: 'Three scoops of ice cream topped with hot fudge, nuts, and a cherry.', ingredients: ['Vanilla ice cream', 'Hot fudge', 'Whipped cream', 'Peanuts', 'Cherry'], price: 5.99, calories: 540, prepTimeMinutes: 6, isVegetarian: true, keyword: 'icecream,sundae' },

  // Beverages
  { name: 'Fresh Lemonade', category: 'Beverages', description: 'Hand-squeezed lemonade with a hint of mint.', ingredients: ['Lemon', 'Sugar', 'Mint', 'Water'], price: 3.99, calories: 120, prepTimeMinutes: 5, isVegetarian: true, isVegan: true, keyword: 'lemonade,drink' },
  { name: 'Iced Caramel Latte', category: 'Beverages', description: 'Espresso, milk, and caramel drizzle over ice.', ingredients: ['Espresso', 'Milk', 'Caramel syrup', 'Ice'], price: 4.99, calories: 210, prepTimeMinutes: 5, isVegetarian: true, keyword: 'coffee,latte' },
  { name: 'Mango Smoothie', category: 'Beverages', description: 'Blended ripe mango with yogurt and a touch of honey.', ingredients: ['Mango', 'Yogurt', 'Honey', 'Ice'], price: 4.49, calories: 240, prepTimeMinutes: 5, isVegetarian: true, keyword: 'smoothie,mango' },
  { name: 'Sparkling Mojito Mocktail', category: 'Beverages', description: 'Lime, mint, and soda water over ice — all the flavor, no alcohol.', ingredients: ['Lime', 'Mint', 'Soda water', 'Sugar syrup'], price: 5.49, calories: 90, prepTimeMinutes: 5, isVegetarian: true, isVegan: true, keyword: 'mojito,mocktail' },

  // Breakfast
  { name: 'Classic Pancake Stack', category: 'Breakfast', description: 'Fluffy buttermilk pancakes with maple syrup and butter.', ingredients: ['Flour', 'Buttermilk', 'Eggs', 'Maple syrup', 'Butter'], price: 8.99, calories: 620, prepTimeMinutes: 15, isVegetarian: true, isFeatured: true, keyword: 'pancakes,breakfast' },
  { name: 'Avocado Toast', category: 'Breakfast', description: 'Smashed avocado on toasted sourdough with chili flakes and lime.', ingredients: ['Sourdough bread', 'Avocado', 'Lime', 'Chili flakes'], price: 7.49, calories: 350, prepTimeMinutes: 8, isVegetarian: true, isVegan: true, keyword: 'avocadotoast,breakfast' },
  { name: 'Full English Breakfast', category: 'Breakfast', description: 'Eggs, bacon, sausage, beans, grilled tomato, and toast.', ingredients: ['Eggs', 'Bacon', 'Sausage', 'Baked beans', 'Tomato', 'Toast'], price: 11.99, calories: 890, prepTimeMinutes: 20, keyword: 'englishbreakfast,eggs' },
  { name: 'Belgian Waffles', category: 'Breakfast', description: 'Crispy waffles topped with berries and whipped cream.', ingredients: ['Flour', 'Eggs', 'Milk', 'Mixed berries', 'Whipped cream'], price: 8.49, calories: 580, prepTimeMinutes: 12, isVegetarian: true, keyword: 'waffles,berries' },

  // Fast food (existing category)
  { name: 'Crispy Chicken Wrap', category: 'Fast food', description: 'Crispy fried chicken, lettuce, and mayo wrapped in a soft tortilla.', ingredients: ['Chicken breast', 'Tortilla', 'Lettuce', 'Mayo'], price: 8.99, calories: 610, prepTimeMinutes: 12, keyword: 'wrap,chicken' },
  { name: 'Loaded Cheese Fries', category: 'Fast food', description: 'Crispy fries smothered in melted cheese and bacon bits.', ingredients: ['Potato', 'Cheddar cheese', 'Bacon bits'], price: 5.99, calories: 720, prepTimeMinutes: 10, isVegetarian: true, keyword: 'fries,cheese' },
];

const STAFF = [
  { name: 'Elena Vargas', email: 'manager@savoria.com', password: 'Manager@123', role: 'manager', phone: '+1 555-0301' },
  { name: 'Marco Rossi', email: 'chef1@savoria.com', password: 'Chef@12345', role: 'chef', phone: '+1 555-0302' },
  { name: 'Aiko Tanaka', email: 'chef2@savoria.com', password: 'Chef@12345', role: 'chef', phone: '+1 555-0303' },
  { name: 'James Carter', email: 'waiter@savoria.com', password: 'Waiter@123', role: 'waiter', phone: '+1 555-0304' },
  { name: 'Priya Nair', email: 'cashier@savoria.com', password: 'Cashier@123', role: 'cashier', phone: '+1 555-0305' },
  { name: 'Diego Alvarez', email: 'rider@savoria.com', password: 'Rider@12345', role: 'rider', phone: '+1 555-0306' },
];

const COUPONS = [
  { code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10, maxDiscount: 15, minPurchase: 0, expiryDate: daysFromNow(90) },
  { code: 'FREESHIP', description: 'Free delivery on orders over $20', type: 'free_delivery', value: 0, minPurchase: 20, expiryDate: daysFromNow(60) },
  { code: 'SAVE5', description: '$5 off orders over $25', type: 'flat', value: 5, minPurchase: 25, expiryDate: daysFromNow(45) },
];

const BLOG_POSTS = [
  { title: '5 Tips for the Perfect Homemade Pizza', excerpt: 'Our chefs share their secrets for restaurant-quality pizza at home.', content: 'Great pizza starts with great dough. Let it rest for at least 24 hours in the fridge for the best flavor and texture. Preheat your oven (and pizza stone, if you have one) as hot as it will go. Use San Marzano tomatoes for the sauce, fresh mozzarella, and don\'t overload your toppings — less is more. Finish with a drizzle of good olive oil right out of the oven.', category: 'recipe', tags: ['pizza', 'recipe', 'tips'], keyword: 'pizza,cooking' },
  { title: 'Behind the Scenes: Meet Our Head Chef', excerpt: 'Get to know the culinary vision driving our seasonal menu.', content: 'Our head chef trained in kitchens across three continents before bringing that experience to Savoria. Every dish on our menu reflects a philosophy of fresh, local ingredients treated simply and respectfully. This season, expect more seasonal vegetables, house-made pasta, and a renewed focus on sustainable seafood.', category: 'news', tags: ['chef', 'kitchen', 'team'], keyword: 'chef,kitchen' },
  { title: 'Summer Menu Launch Event', excerpt: 'Join us for a night of tastings as we unveil our new summer dishes.', content: 'We are excited to invite you to our Summer Menu Launch Event next month. Enjoy live tastings of our new seasonal dishes, cocktail pairings, and live music on the patio. Reservations are limited, so book your spot early through our reservations page.', category: 'event', tags: ['event', 'summer', 'menu'], keyword: 'restaurant,event' },
];

function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function seed() {
  await connectDB();

  // Categories
  const categoryIds = {};
  for (const cat of CATEGORIES) {
    let doc = await Category.findOne({ name: cat.name });
    if (!doc) {
      doc = await Category.create({
        name: cat.name,
        description: cat.description,
        image: img(cat.keyword, `cat-${cat.name}`),
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category already exists, reusing: ${cat.name}`);
    }
    categoryIds[cat.name] = doc._id;
  }

  // Dishes
  let dishesCreated = 0;
  for (const dish of DISHES) {
    const existing = await Dish.findOne({ name: dish.name });
    if (existing) {
      console.log(`Dish already exists, skipping: ${dish.name}`);
      continue;
    }
    await Dish.create({
      name: dish.name,
      description: dish.description,
      ingredients: dish.ingredients,
      images: [img(dish.keyword, dish.name)],
      category: categoryIds[dish.category],
      price: dish.price,
      calories: dish.calories,
      prepTimeMinutes: dish.prepTimeMinutes,
      isVegetarian: !!dish.isVegetarian,
      isVegan: !!dish.isVegan,
      isFeatured: !!dish.isFeatured,
    });
    dishesCreated++;
  }
  console.log(`Created ${dishesCreated} dishes.`);

  // Staff
  for (const member of STAFF) {
    const existing = await User.findOne({ email: member.email });
    if (existing) {
      console.log(`Staff already exists, skipping: ${member.email}`);
      continue;
    }
    await User.create({ ...member, isEmailVerified: true });
    console.log(`Created staff: ${member.email} (${member.role})`);
  }

  // Coupons
  for (const coupon of COUPONS) {
    const existing = await Coupon.findOne({ code: coupon.code });
    if (existing) {
      console.log(`Coupon already exists, skipping: ${coupon.code}`);
      continue;
    }
    await Coupon.create(coupon);
    console.log(`Created coupon: ${coupon.code}`);
  }

  // Blog posts (authored by an admin account)
  const author = await User.findOne({ role: 'admin' });
  if (author) {
    for (const post of BLOG_POSTS) {
      const existing = await BlogPost.findOne({ title: post.title });
      if (existing) {
        console.log(`Blog post already exists, skipping: ${post.title}`);
        continue;
      }
      await BlogPost.create({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        author: author._id,
        coverImage: img(post.keyword, post.title),
      });
      console.log(`Created blog post: ${post.title}`);
    }
  } else {
    console.log('No admin user found — skipping blog posts. Run `npm run seed:users` first.');
  }

  await mongoose.disconnect();
  console.log('Menu/staff/demo seeding complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
