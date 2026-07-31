import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiFlag, FiMessageSquare, FiStar } from 'react-icons/fi';
import { reviewService } from '@services/reviewService';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';
import cn from '@utils/cn';

function ReplyForm({ review, onReplied }) {
  const [text, setText] = useState(review.restaurantReply?.text || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await reviewService.reply(review._id, text.trim());
      toast.success('Reply posted');
      onReplied();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        className="flex-1 rounded-xl border border-secondary-500/20 bg-white px-3 py-2 text-sm dark:bg-secondary-800 dark:text-secondary-50"
      />
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? 'Sending…' : 'Reply'}
      </Button>
    </form>
  );
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportedOnly, setReportedOnly] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    reviewService
      .listAll(reportedOnly ? { reported: 'true' } : {})
      .then(({ data }) => setReviews(data.data.reviews))
      .finally(() => setLoading(false));
  };

  useEffect(fetchReviews, [reportedOnly]);

  const handleModerate = async (review) => {
    try {
      await reviewService.moderate(review._id, !review.isHidden);
      toast.success(review.isHidden ? 'Review unhidden' : 'Review hidden');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update review');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Reviews</h1>
        <button
          onClick={() => setReportedOnly((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium',
            reportedOnly
              ? 'bg-red-500/10 text-red-600'
              : 'bg-secondary-500/10 text-secondary-500',
          )}
        >
          <FiFlag size={14} /> {reportedOnly ? 'Showing reported' : 'Show reported only'}
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : reviews.length === 0 ? (
        <p className="mt-10 text-center text-sm text-secondary-500">No reviews found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl border border-secondary-500/10 bg-white p-5 dark:bg-secondary-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-secondary-900 dark:text-secondary-50">
                    {review.user?.name} <span className="text-secondary-400">on</span>{' '}
                    {review.dish?.name}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.reportCount > 0 && (
                    <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600">
                      {review.reportCount} report{review.reportCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={() => handleModerate(review)}
                    aria-label={review.isHidden ? 'Unhide review' : 'Hide review'}
                    className="text-secondary-400 hover:text-primary-500"
                  >
                    {review.isHidden ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm text-secondary-600 dark:text-secondary-300">{review.comment}</p>

              {review.restaurantReply?.text && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary-500/5 p-3 text-xs text-secondary-500">
                  <FiMessageSquare size={14} className="mt-0.5 shrink-0" />
                  <span>{review.restaurantReply.text}</span>
                </div>
              )}

              <ReplyForm review={review} onReplied={fetchReviews} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
