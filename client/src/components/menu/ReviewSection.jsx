import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import { reviewService } from '@services/reviewService';
import cn from '@utils/cn';

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}>
          <FiStar size={22} className={cn(star <= value ? 'fill-gold text-gold' : 'text-ink/20')} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ dishId }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const fetchReviews = () => {
    setLoading(true);
    reviewService
      .getDishReviews(dishId)
      .then(({ data }) => setReviews(data.data.reviews))
      .finally(() => setLoading(false));
  };

  useEffect(fetchReviews, [dishId]);

  const onSubmit = async ({ comment }) => {
    try {
      await reviewService.createReview({ dishId, rating, comment });
      toast.success('Review submitted');
      reset();
      setRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  const handleLike = async (id) => {
    try {
      await reviewService.likeReview(id);
      fetchReviews();
    } catch {
      toast.error('Could not like review');
    }
  };

  return (
    <div className="mt-24 border-t border-ink/10 pt-16">
      <span className="eyebrow">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </span>

      {isAuthenticated && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 border border-ink/10 p-6">
          <p className="mb-2 font-body text-sm font-medium text-ink/70">Your rating</p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            rows={3}
            placeholder="Share your experience with this dish..."
            {...register('comment', { required: true })}
            className="mt-4 w-full border-b border-ink/15 bg-transparent px-0 py-2.5 font-body text-sm text-ink outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 inline-flex min-h-[44px] items-center justify-center border border-ink bg-ink px-6 font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {!loading && reviews.length === 0 && (
          <p className="font-body text-sm text-ink/50">No reviews yet. Be the first to share your thoughts!</p>
        )}

        {reviews.map((review) => (
          <div key={review._id} className="border border-ink/10 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-ink italic">{review.user?.name}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      size={13}
                      className={i < review.rating ? 'fill-gold text-gold' : 'text-ink/20'}
                    />
                  ))}
                </div>
              </div>
              <span className="font-body text-xs text-ink/40">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 font-body text-sm text-ink/60">{review.comment}</p>

            {review.restaurantReply?.text && (
              <div className="mt-3 border-l-2 border-gold bg-gold/5 p-3 font-body text-sm">
                <p className="font-semibold text-ink">Savoria's reply</p>
                <p className="mt-1 text-ink/60">{review.restaurantReply.text}</p>
              </div>
            )}

            <button
              onClick={() => handleLike(review._id)}
              className="mt-3 flex items-center gap-1.5 font-body text-xs text-ink/50 hover:text-ink"
            >
              <FiThumbsUp size={12} /> Helpful ({review.likes?.length || 0})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
