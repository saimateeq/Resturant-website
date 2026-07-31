import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import GoogleLoginButton from '@components/common/GoogleLoginButton';
import { useAuth } from '@hooks/useAuth';
import { useSEO } from '@hooks/useSEO';

export default function Register() {
  useSEO({ title: 'Create Account' });
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await registerUser(formData);
      toast.success('Check your email for a verification code');
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Create your account
      </h2>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Join Savoria for faster checkout and reservations
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+1 555 012 3456"
          {...register('phone')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
          })}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-secondary-500/20" />
        <span className="text-xs text-secondary-400">OR</span>
        <div className="h-px flex-1 bg-secondary-500/20" />
      </div>

      <GoogleLoginButton />

      <p className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400">
          Login
        </Link>
      </p>
    </div>
  );
}
