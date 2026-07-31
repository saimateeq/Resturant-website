import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import GoogleLoginButton from '@components/common/GoogleLoginButton';
import { useAuth } from '@hooks/useAuth';
import { useSEO } from '@hooks/useSEO';
import { authService } from '@services/authService';
import { USER_ROLES } from '@constants';

const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];

export default function Login() {
  useSEO({ title: 'Login' });
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    setUnverifiedEmail(null);
    try {
      const { user } = await login(formData);
      toast.success('Welcome back!');
      const fallback = ADMIN_ROLES.includes(user?.role) ? '/admin' : '/dashboard';
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      const isUnverified = err.response?.data?.errors?.includes('EMAIL_NOT_VERIFIED');
      if (isUnverified) {
        setUnverifiedEmail(formData.email);
      }
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleVerifyClick = async () => {
    try {
      await authService.resendOtp(unverifiedEmail);
      toast.success('A new verification code has been sent');
    } catch {
      // fall through — VerifyEmail page has its own resend button
    }
    navigate('/verify-email', { state: { email: unverifiedEmail } });
  };

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Welcome back
      </h2>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Log in to manage your orders and reservations
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-9 right-3 text-secondary-400"
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-secondary-600 dark:text-secondary-300">
            <input type="checkbox" className="rounded" {...register('rememberMe')} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </Button>
      </form>

      {unverifiedEmail && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Your email isn't verified yet.
          </p>
          <button
            type="button"
            onClick={handleVerifyClick}
            className="mt-2 text-sm font-semibold text-primary-600 dark:text-primary-400"
          >
            Verify Email
          </button>
        </div>
      )}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-secondary-500/20" />
        <span className="text-xs text-secondary-400">OR</span>
        <div className="h-px flex-1 bg-secondary-500/20" />
      </div>

      <GoogleLoginButton />

      <p className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
        No account?{' '}
        <Link to="/register" className="font-medium text-primary-600 dark:text-primary-400">
          Register
        </Link>
      </p>
    </div>
  );
}
