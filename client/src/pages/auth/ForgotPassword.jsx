import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { authService } from '@services/authService';

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
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-50">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
          If an account exists for that email, we've sent a password reset link.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary-600 dark:text-primary-400">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Forgot password
      </h2>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400">
          Log in
        </Link>
      </p>
    </div>
  );
}
