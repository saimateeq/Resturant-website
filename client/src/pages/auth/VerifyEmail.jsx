import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { useAuth } from '@hooks/useAuth';
import { authService } from '@services/authService';

export default function VerifyEmail() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email } });

  const onSubmit = async (formData) => {
    try {
      await verifyOtp(formData);
      toast.success('Email verified!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    const currentEmail = document.getElementById('email')?.value || email;
    if (!currentEmail) return toast.error('Enter your email first');
    setResending(true);
    try {
      await authService.resendOtp(currentEmail);
      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Verify your email
      </h2>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Enter the 6-digit code we sent to your inbox
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Verification code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          error={errors.otp?.message}
          {...register('otp', { required: 'Code is required', minLength: 6, maxLength: 6 })}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Verifying…' : 'Verify Email'}
        </Button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="mt-4 w-full text-center text-sm text-primary-600 dark:text-primary-400"
      >
        {resending ? 'Sending…' : "Didn't get a code? Resend"}
      </button>
    </div>
  );
}
