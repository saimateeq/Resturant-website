import Ingredient from '../models/Ingredient.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listIngredients = asyncHandler(async (req, res) => {
  const { lowStock, expiringSoon } = req.query;
  const filter = {};

  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$currentStock', '$lowStockThreshold'] };
  }
  if (expiringSoon === 'true') {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    filter.expiryDate = { $lte: sevenDaysFromNow, $gte: new Date() };
  }

  const ingredients = await Ingredient.find(filter).sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, { ingredients }));
});

export const createIngredient = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.create(req.body);
  res.status(201).json(new ApiResponse(201, { ingredient }, 'Ingredient added'));
});

export const updateIngredient = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!ingredient) throw new ApiError(404, 'Ingredient not found');
  res.status(200).json(new ApiResponse(200, { ingredient }, 'Ingredient updated'));
});

export const deleteIngredient = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
  if (!ingredient) throw new ApiError(404, 'Ingredient not found');
  res.status(200).json(new ApiResponse(200, null, 'Ingredient removed'));
});

export const recordPurchase = asyncHandler(async (req, res) => {
  const { quantity, cost, supplier } = req.body;
  const ingredient = await Ingredient.findById(req.params.id);
  if (!ingredient) throw new ApiError(404, 'Ingredient not found');

  ingredient.currentStock += Number(quantity);
  ingredient.purchaseHistory.push({ quantity, cost, supplier });
  await ingredient.save();

  res.status(200).json(new ApiResponse(200, { ingredient }, 'Purchase recorded'));
});
