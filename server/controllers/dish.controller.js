import Dish from '../models/Dish.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../services/upload.service.js';

const SORT_MAP = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { ratingsAverage: -1 },
  popular: { orderCount: -1 },
  newest: { createdAt: -1 },
};

export const listDishes = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    vegetarian,
    vegan,
    halal,
    sort = 'newest',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const filter = { isAvailable: true };

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (vegetarian === 'true') filter.isVegetarian = true;
  if (vegan === 'true') filter.isVegan = true;
  if (halal === 'true') filter.isHalal = true;
  if (featured === 'true') filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [dishes, total] = await Promise.all([
    Dish.find(filter)
      .populate('category', 'name slug')
      .sort(SORT_MAP[sort] || SORT_MAP.newest)
      .skip(skip)
      .limit(limitNum),
    Dish.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      dishes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    }),
  );
});

export const getDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!dish) throw new ApiError(404, 'Dish not found');

  dish.viewCount += 1;
  await dish.save({ validateBeforeSave: false });

  const related = await Dish.find({
    category: dish.category,
    _id: { $ne: dish._id },
    isAvailable: true,
  })
    .limit(4)
    .select('name slug images price discountPrice ratingsAverage');

  res.status(200).json(new ApiResponse(200, { dish, related }));
});

export const createDish = asyncHandler(async (req, res) => {
  const images = req.files?.length
    ? await Promise.all(req.files.map((file) => uploadImage(file.path, 'savoria/dishes')))
    : [];

  const dish = await Dish.create({ ...req.body, images });
  res.status(201).json(new ApiResponse(201, { dish }, 'Dish created'));
});

export const updateDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new ApiError(404, 'Dish not found');

  if (req.files?.length) {
    const newImages = await Promise.all(
      req.files.map((file) => uploadImage(file.path, 'savoria/dishes')),
    );
    dish.images.push(...newImages);
  }

  Object.assign(dish, req.body);
  await dish.save();

  res.status(200).json(new ApiResponse(200, { dish }, 'Dish updated'));
});

export const deleteDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new ApiError(404, 'Dish not found');

  await Promise.all(dish.images.map((img) => deleteImage(img.publicId)));
  await dish.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Dish deleted'));
});

export const removeDishImage = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) throw new ApiError(404, 'Dish not found');

  const image = dish.images.id(req.params.imageId);
  if (!image) throw new ApiError(404, 'Image not found on this dish');

  await deleteImage(image.publicId);
  dish.images.pull(req.params.imageId);
  await dish.save();

  res.status(200).json(new ApiResponse(200, { dish }, 'Image removed'));
});

export const getTrendingDishes = asyncHandler(async (req, res) => {
  const dishes = await Dish.find({ isAvailable: true })
    .sort({ orderCount: -1, viewCount: -1 })
    .limit(8)
    .select('name slug images price discountPrice ratingsAverage');

  res.status(200).json(new ApiResponse(200, { dishes }));
});
