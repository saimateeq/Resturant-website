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
      <div className="bg-cream py-24 text-center">
        <p className="font-body text-sm text-ink/50">Post not found.</p>
        <Link to="/blog" className="mt-4 inline-block font-body text-sm text-gold">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <span className="eyebrow">{post.category.replace('-', ' ')}</span>
          <h1 className="mt-4 font-display text-3xl leading-[1.1] text-ink italic sm:text-5xl">{post.title}</h1>
          <p className="mt-4 font-body text-sm text-ink/50">
            {post.author?.name} · {new Date(post.publishedAt).toDateString()} · {post.viewCount} views
          </p>

          {post.coverImage?.url && (
            <div className="mt-8 aspect-video overflow-hidden bg-ink/5">
              <img src={post.coverImage.url} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="mt-10 max-w-none space-y-4 font-body leading-relaxed whitespace-pre-line text-ink/70">
            {post.content}
          </div>

          {post.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="border border-ink/15 px-3 py-1 font-body text-xs text-ink/60">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.article>

        {related.length > 0 && (
          <div className="mx-auto mt-20 max-w-3xl border-t border-ink/10 pt-12">
            <span className="eyebrow">More Like This</span>
            <div className="mt-6 space-y-3">
              {related.map((r) => (
                <Link
                  key={r._id}
                  to={`/blog/${r.slug}`}
                  className="block border border-ink/10 p-4 transition-colors hover:border-gold/50"
                >
                  <p className="font-display text-ink italic">{r.title}</p>
                  <p className="mt-1 font-body text-sm text-ink/50">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
