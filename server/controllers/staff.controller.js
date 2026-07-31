import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const STAFF_ROLES = ['manager', 'chef', 'waiter', 'cashier', 'rider', 'admin'];

export const listStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: { $in: STAFF_ROLES } })
    .select('name email phone role isBlocked createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { staff }));
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!STAFF_ROLES.includes(role)) throw new ApiError(400, 'Invalid staff role');

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const staff = await User.create({
    name,
    email,
    password,
    phone,
    role,
    isEmailVerified: true,
  });

  res.status(201).json(new ApiResponse(201, { staff: staff.toSafeObject() }, 'Staff member created'));
});

export const updateStaffRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!STAFF_ROLES.includes(role)) throw new ApiError(400, 'Invalid staff role');

  const staff = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  res.status(200).json(new ApiResponse(200, { staff }, 'Role updated'));
});

export const removeStaff = asyncHandler(async (req, res) => {
  const staff = await User.findById(req.params.id);
  if (!staff) throw new ApiError(404, 'Staff member not found');
  if (!STAFF_ROLES.includes(staff.role)) throw new ApiError(400, 'This user is not a staff member');

  await staff.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Staff member removed'));
});
