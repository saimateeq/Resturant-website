import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '@services/authService';

const fieldClass =
  'w-full border-b border-ink/15 bg-transparent px-0 py-2.5 font-body text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-gold';
const labelClass = 'mb-1.5 block font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="font-display text-2xl text-ink italic">Check your inbox</h2>
        <p className="mt-3 font-body text-sm text-ink/55">
          If an account exists for that email, we've sent a password reset link.
        </p>
        <Link to="/login" className="mt-6 inline-block font-body text-sm font-medium text-gold">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center font-display text-2xl text-ink italic">Forgot password</h2>
      <p className="mt-2 text-center font-body text-sm text-ink/55">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className={fieldClass}
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-ink/55">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-gold">
          Log in
        </Link>
      </p>
    </div>
  );
}
