import BlogPost from '../models/BlogPost.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../services/upload.service.js';

export const listPosts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 9 } = req.query;

  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-content'),
    BlogPost.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      posts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    }),
  );
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug }).populate('author', 'name avatar');
  if (!post) throw new ApiError(404, 'Blog post not found');

  post.viewCount += 1;
  await post.save({ validateBeforeSave: false });

  const related = await BlogPost.find({
    category: post.category,
    _id: { $ne: post._id },
    isPublished: true,
  })
    .limit(3)
    .select('title slug excerpt coverImage publishedAt');

  res.status(200).json(new ApiResponse(200, { post, related }));
});

export const listAllPostsAdmin = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find().populate('author', 'name').sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { posts }));
});

export const createPost = asyncHandler(async (req, res) => {
  const { title, excerpt, content, category, tags, isPublished } = req.body;

  let coverImage = {};
  if (req.file) coverImage = await uploadImage(req.file.path, 'savoria/blog');

  const post = await BlogPost.create({
    title,
    excerpt,
    content,
    category,
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    isPublished,
    coverImage,
    author: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { post }, 'Post created'));
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Blog post not found');

  if (req.file) {
    if (post.coverImage?.publicId) await deleteImage(post.coverImage.publicId);
    post.coverImage = await uploadImage(req.file.path, 'savoria/blog');
  }

  const { tags, ...rest } = req.body;
  Object.assign(post, rest);
  if (tags) post.tags = Array.isArray(tags) ? tags : [tags];

  await post.save();

  res.status(200).json(new ApiResponse(200, { post }, 'Post updated'));
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Blog post not found');

  if (post.coverImage?.publicId) await deleteImage(post.coverImage.publicId);
  await post.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Post deleted'));
});
