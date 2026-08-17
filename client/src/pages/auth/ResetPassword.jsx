import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '@services/authService';

const fieldClass =
  'w-full border-b border-ink/15 bg-transparent px-0 py-2.5 font-body text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-gold';
const labelClass = 'mb-1.5 block font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase';

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
      <h2 className="text-center font-display text-2xl text-ink italic">Reset password</h2>
      <p className="mt-2 text-center font-body text-sm text-ink/55">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label className={labelClass}>New password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            className={fieldClass}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Must be at least 8 characters' },
            })}
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Confirm new password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            className={fieldClass}
            {...register('confirmPassword', {
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
        >
          {isSubmitting ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-ink/55">
        <Link to="/login" className="font-medium text-gold">
          Back to login
        </Link>
      </p>
    </div>
  );
}
