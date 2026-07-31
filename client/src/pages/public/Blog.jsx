import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '@services/blogService';
import SkeletonCard from '@components/common/SkeletonCard';
import Pagination from '@components/common/Pagination';
import { useSEO } from '@hooks/useSEO';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'recipe', label: 'Recipes' },
  { value: 'cooking-tips', label: 'Cooking Tips' },
  { value: 'news', label: 'News' },
  { value: 'event', label: 'Events' },
];

export default function Blog() {
  useSEO({
    title: 'Blog',
    description: 'Recipes, cooking tips, and news from the Savoria kitchen.',
  });

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogService
      .getPosts({ category: category || undefined, page })
      .then(({ data }) => {
        setPosts(data.data.posts);
        setPagination(data.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [category, page]);

  return (
    <div className="container-app py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">Blog</h1>
        <p className="mt-3 text-secondary-500 dark:text-secondary-400">
          Recipes, cooking tips, and stories from our kitchen
        </p>
      </motion.div>

      <div className="mt-8 flex justify-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setCategory(c.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              category === c.value
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : posts.map((post) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-2xl border border-secondary-500/10 bg-white shadow-soft dark:bg-secondary-900"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-video overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                    {post.coverImage?.url && (
                      <img
                        src={post.coverImage.url}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-primary-600 uppercase dark:text-primary-400">
                      {post.category.replace('-', ' ')}
                    </span>
                    <h2 className="mt-1 font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-secondary-500 dark:text-secondary-400">
                      {post.excerpt}
                    </p>
                    <p className="mt-3 text-xs text-secondary-400">
                      {new Date(post.publishedAt).toLocaleDateString()} · {post.author?.name}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
      </div>

      {!loading && posts.length === 0 && (
        <p className="mt-16 text-center text-secondary-500 dark:text-secondary-400">No posts yet.</p>
      )}

      <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  );
}
