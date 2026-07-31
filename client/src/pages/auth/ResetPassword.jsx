import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { authService } from '@services/authService';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      await authService.resetPassword({ token, password });
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    }
  };

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Reset password
      </h2>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
          })}
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting…' : 'Reset Password'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
        <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400">
          Back to login
        </Link>
      </p>
    </div>
  );
}
