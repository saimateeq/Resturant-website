import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import GoogleLoginButton from '@components/common/GoogleLoginButton';
import { useAuth } from '@hooks/useAuth';
import { useSEO } from '@hooks/useSEO';
import { authService } from '@services/authService';

const STEPS = { EMAIL: 'email', OTP: 'otp', DETAILS: 'details' };

const STEP_COPY = {
  [STEPS.EMAIL]: 'Join Savoria for faster checkout and reservations',
  [STEPS.OTP]: 'Enter the 6-digit code we sent to your inbox',
  [STEPS.DETAILS]: 'Email verified — set up your account details',
};

export default function Register() {
  useSEO({ title: 'Create Account' });
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm();
  const otpForm = useForm();
  const detailsForm = useForm();

  const handleSendOtp = async (formData) => {
    try {
      await authService.sendSignupOtp(formData.email);
      setEmail(formData.email);
      toast.success('Verification code sent to your email');
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send verification code');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.sendSignupOtp(email);
      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (formData) => {
    try {
      const { data } = await authService.verifySignupOtp({ email, otp: formData.otp });
      setVerificationToken(data.data.verificationToken);
      toast.success('Email verified!');
      setStep(STEPS.DETAILS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      if (err.response?.data?.errors?.includes('OTP_ATTEMPTS_EXCEEDED')) {
        setStep(STEPS.EMAIL);
      }
    }
  };

  const handleRegister = async (formData) => {
    try {
      const { user } = await registerUser({ ...formData, email, verificationToken });
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      if (err.response?.data?.errors?.includes('EMAIL_NOT_VERIFIED')) {
        setStep(STEPS.EMAIL);
      }
    }
  };

  return (
    <div>
      <h2 className="text-center text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Create your account
      </h2>
      <p className="mt-2 text-center text-sm text-secondary-500 dark:text-secondary-400">
        {STEP_COPY[step]}
      </p>

      {step === STEPS.EMAIL && (
        <>
          <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register('email', { required: 'Email is required' })}
            />
            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? 'Sending code…' : 'Continue'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-secondary-500/20" />
            <span className="text-xs text-secondary-400">OR</span>
            <div className="h-px flex-1 bg-secondary-500/20" />
          </div>

          <GoogleLoginButton />
        </>
      )}

      {step === STEPS.OTP && (
        <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="mt-6 space-y-4">
          <Input
            label="Verification code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register('otp', { required: 'Code is required', minLength: 6, maxLength: 6 })}
          />

          <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
            {otpForm.formState.isSubmitting ? 'Verifying…' : 'Verify Email'}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-center text-sm text-primary-600 dark:text-primary-400"
          >
            {resending ? 'Sending…' : "Didn't get a code? Resend"}
          </button>
          <button
            type="button"
            onClick={() => setStep(STEPS.EMAIL)}
            className="w-full text-center text-sm text-secondary-500 dark:text-secondary-400"
          >
            Use a different email
          </button>
        </form>
      )}

      {step === STEPS.DETAILS && (
        <form onSubmit={detailsForm.handleSubmit(handleRegister)} className="mt-6 space-y-4">
          <Input
            label="Full name"
            placeholder="Jane Doe"
            error={detailsForm.formState.errors.name?.message}
            {...detailsForm.register('name', { required: 'Name is required' })}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+1 555 012 3456"
            {...detailsForm.register('phone')}
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              error={detailsForm.formState.errors.password?.message}
              {...detailsForm.register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Must be at least 8 characters' },
              })}
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
          <div className="relative">
            <Input
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              error={detailsForm.formState.errors.confirmPassword?.message}
              {...detailsForm.register('confirmPassword', {
                validate: (value) =>
                  value === detailsForm.watch('password') || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute top-9 right-3 text-secondary-400"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={detailsForm.formState.isSubmitting}>
            {detailsForm.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-secondary-500 dark:text-secondary-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400">
          Login
        </Link>
      </p>
    </div>
  );
}
