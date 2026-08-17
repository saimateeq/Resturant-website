import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import GoogleLoginButton from '@components/common/GoogleLoginButton';
import { useAuth } from '@hooks/useAuth';
import { useSEO } from '@hooks/useSEO';
import { USER_ROLES } from '@constants';

const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];

const fieldClass =
  'w-full border-b border-ink/15 bg-transparent px-0 py-2.5 font-body text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-gold';
const labelClass = 'mb-1.5 block font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase';

export default function Login() {
  useSEO({ title: 'Login' });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const { user } = await login(formData);
      toast.success('Welcome back!');
      const fallback = ADMIN_ROLES.includes(user?.role) ? '/admin' : '/dashboard';
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2 className="text-center font-display text-2xl text-ink italic">Welcome back</h2>
      <p className="mt-2 text-center font-body text-sm text-ink/55">
        Log in to manage your orders and reservations
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

        <div className="relative">
          <label className={labelClass}>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={fieldClass}
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-7 right-0 text-ink/40 hover:text-ink"
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
          {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between font-body text-sm">
          <label className="flex items-center gap-2 text-ink/60">
            <input type="checkbox" className="accent-ink" {...register('rememberMe')} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-ink/60 hover:text-gold">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="font-body text-xs text-ink/40">OR</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <GoogleLoginButton />

      <p className="mt-6 text-center font-body text-sm text-ink/55">
        No account?{' '}
        <Link to="/register" className="font-medium text-gold">
          Register
        </Link>
      </p>
    </div>
  );
}
