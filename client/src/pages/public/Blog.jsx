import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '@services/blogService';
import SkeletonCard from '@components/common/SkeletonCard';
import Pagination from '@components/common/Pagination';
import { useSEO } from '@hooks/useSEO';
import cn from '@utils/cn';

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
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="eyebrow">The Journal</span>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
            Recipes, tips & stories
          </h1>
          <p className="mt-4 font-body text-sm text-ink/60">From our kitchen to yours</p>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCategory(c.value);
                setPage(1);
              }}
              className={cn(
                'rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors',
                category === c.value ? 'bg-ink text-cream' : 'border border-ink/15 text-ink/60 hover:border-ink/40',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : posts.map((post) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group overflow-hidden border border-ink/10 bg-cream"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="aspect-video overflow-hidden bg-ink/5">
                      {post.coverImage?.url && (
                        <img
                          src={post.coverImage.url}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <span className="font-body text-xs font-semibold tracking-[0.1em] text-gold uppercase">
                        {post.category.replace('-', ' ')}
                      </span>
                      <h2 className="mt-2 font-display text-lg text-ink italic">{post.title}</h2>
                      <p className="mt-2 line-clamp-2 font-body text-sm text-ink/55">{post.excerpt}</p>
                      <p className="mt-3 font-body text-xs text-ink/40">
                        {new Date(post.publishedAt).toLocaleDateString()} · {post.author?.name}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
        </div>

        {!loading && posts.length === 0 && (
          <p className="mt-16 text-center font-body text-sm text-ink/50">No posts yet.</p>
        )}

        <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
