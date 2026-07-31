import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '@services/blogService';
import Loader from '@components/common/Loader';
import { useSEO } from '@hooks/useSEO';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: post?.title,
    description: post?.excerpt,
    image: post?.coverImage?.url,
    type: 'article',
  });

  useEffect(() => {
    setLoading(true);
    blogService
      .getPost(slug)
      .then(({ data }) => {
        setPost(data.data.post);
        setRelated(data.data.related);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader />;

  if (!post) {
    return (
      <div className="container-app py-24 text-center">
        <p className="text-secondary-500 dark:text-secondary-400">Post not found.</p>
        <Link to="/blog" className="mt-4 inline-block text-primary-600 dark:text-primary-400">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-16">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <span className="text-sm font-medium text-primary-600 uppercase dark:text-primary-400">
          {post.category.replace('-', ' ')}
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold text-secondary-900 dark:text-secondary-50 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-secondary-500">
          {post.author?.name} · {new Date(post.publishedAt).toDateString()} · {post.viewCount} views
        </p>

        {post.coverImage?.url && (
          <div className="mt-6 aspect-video overflow-hidden rounded-3xl bg-secondary-100 dark:bg-secondary-800">
            <img src={post.coverImage.url} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mt-8 max-w-none space-y-4 leading-relaxed whitespace-pre-line text-secondary-700 dark:text-secondary-300">
          {post.content}
        </div>

        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary-500/10 px-3 py-1 text-xs text-secondary-600 dark:text-secondary-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.article>

      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-display text-xl font-bold text-secondary-900 dark:text-secondary-50">
            More like this
          </h2>
          <div className="mt-4 space-y-3">
            {related.map((r) => (
              <Link
                key={r._id}
                to={`/blog/${r.slug}`}
                className="block rounded-xl border border-secondary-500/10 p-4 hover:border-primary-500/40"
              >
                <p className="font-medium text-secondary-900 dark:text-secondary-50">{r.title}</p>
                <p className="mt-1 text-sm text-secondary-500">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
