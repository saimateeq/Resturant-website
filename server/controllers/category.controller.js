import Category from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../services/upload.service.js';

export const listCategories = asyncHandler(async (req, res) => {
  const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ order: 1, name: 1 });
  res.status(200).json(new ApiResponse(200, { categories }));
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(200).json(new ApiResponse(200, { category }));
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, order } = req.body;
  let image = {};

  if (req.file) {
    image = await uploadImage(req.file.path, 'savoria/categories');
  }

  const category = await Category.create({ name, description, order, image });
  res.status(201).json(new ApiResponse(201, { category }, 'Category created'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  if (req.file) {
    if (category.image?.publicId) await deleteImage(category.image.publicId);
    category.image = await uploadImage(req.file.path, 'savoria/categories');
  }

  Object.assign(category, req.body);
  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category updated'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  if (category.image?.publicId) await deleteImage(category.image.publicId);
  await category.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});
