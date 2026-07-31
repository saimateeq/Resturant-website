import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import { reviewService } from '@services/reviewService';
import cn from '@utils/cn';
import Button from '@components/ui/Button';

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}>
          <FiStar
            size={22}
            className={cn(star <= value ? 'fill-primary-500 text-primary-500' : 'text-secondary-300')}
          />
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
    <div className="mt-20">
      <h2 className="font-display text-2xl font-bold text-secondary-900 dark:text-secondary-50">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {isAuthenticated && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900"
        >
          <p className="mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">Your rating</p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            rows={3}
            placeholder="Share your experience with this dish..."
            {...register('comment', { required: true })}
            className="mt-4 w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-50"
          />
          <Button type="submit" size="sm" className="mt-3" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {!loading && reviews.length === 0 && (
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            No reviews yet. Be the first to share your thoughts!
          </p>
        )}

        {reviews.map((review) => (
          <div
            key={review._id}
            className="rounded-2xl border border-secondary-500/10 bg-white p-5 dark:bg-secondary-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-secondary-900 dark:text-secondary-50">
                  {review.user?.name}
                </span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      size={13}
                      className={i < review.rating ? 'fill-primary-500 text-primary-500' : 'text-secondary-300'}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-secondary-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">{review.comment}</p>

            {review.restaurantReply?.text && (
              <div className="mt-3 rounded-xl bg-primary-500/5 p-3 text-sm">
                <p className="font-medium text-primary-600 dark:text-primary-400">Savoria's reply</p>
                <p className="mt-1 text-secondary-600 dark:text-secondary-300">{review.restaurantReply.text}</p>
              </div>
            )}

            <button
              onClick={() => handleLike(review._id)}
              className="mt-3 flex items-center gap-1.5 text-xs text-secondary-500 dark:text-secondary-400"
            >
              <FiThumbsUp size={12} /> Helpful ({review.likes?.length || 0})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
