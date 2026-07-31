import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { blogService } from '@services/blogService';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';

const CATEGORIES = ['recipe', 'cooking-tips', 'news', 'event'];

function PostFormModal({ isOpen, onClose, post, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      reset(
        post
          ? {
              title: post.title,
              excerpt: post.excerpt,
              content: post.content,
              category: post.category,
              tags: post.tags?.join(', '),
              isPublished: post.isPublished,
            }
          : { category: 'news', isPublished: true },
      );
      setFile(null);
    }
  }, [isOpen, post, reset]);

  const onSubmit = async (formData) => {
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          value
            ?.split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .forEach((tag) => payload.append('tags[]', tag));
        } else if (value !== undefined) {
          payload.append(key, value);
        }
      });
      if (file) payload.append('coverImage', file);

      if (post) {
        await blogService.updatePost(post._id, payload);
        toast.success('Post updated');
      } else {
        await blogService.createPost(payload);
        toast.success('Post created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save post');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={post ? 'Edit Post' : 'New Post'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" {...register('title', { required: true })} />
        <Input label="Excerpt" {...register('excerpt', { required: true })} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Content
          </label>
          <textarea
            rows={8}
            {...register('content', { required: true })}
            className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm capitalize dark:bg-secondary-800 dark:text-secondary-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          <Input label="Tags (comma separated)" {...register('tags')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Cover image
          </label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} className="text-sm" />
        </div>

        <label className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300">
          <input type="checkbox" {...register('isPublished')} className="rounded" />
          Published
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Post'}
        </Button>
      </form>
    </Modal>
  );
}

export default function BlogManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const fetchPosts = () => {
    setLoading(true);
    blogService
      .getAllPostsAdmin()
      .then(({ data }) => setPosts(data.data.posts))
      .finally(() => setLoading(false));
  };

  useEffect(fetchPosts, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await blogService.deletePost(id);
      toast.success('Post deleted');
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete post');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Blog Management</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditingPost(null);
            setModalOpen(true);
          }}
        >
          <FiPlus size={14} /> New Post
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-500/10 bg-white dark:bg-secondary-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-secondary-500/10 text-secondary-500">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-b border-secondary-500/5">
                <td className="p-4 font-medium text-secondary-900 dark:text-secondary-50">{post.title}</td>
                <td className="p-4 text-secondary-500 capitalize">{post.category.replace('-', ' ')}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      post.isPublished ? 'bg-green-500/10 text-green-600' : 'bg-secondary-500/10 text-secondary-500'
                    }`}
                  >
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => {
                      setEditingPost(post);
                      setModalOpen(true);
                    }}
                    aria-label="Edit post"
                    className="mr-2 text-secondary-400 hover:text-primary-500"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(post._id)} aria-label="Delete post" className="text-secondary-400 hover:text-red-500">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PostFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        post={editingPost}
        onSaved={fetchPosts}
      />
    </div>
  );
}
