import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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

const fieldClass =
  'w-full border-b border-ink/15 bg-transparent px-0 py-2.5 font-body text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-gold';
const labelClass = 'mb-1.5 block font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase';

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
      <h2 className="text-center font-display text-2xl text-ink italic">Create your account</h2>
      <p className="mt-2 text-center font-body text-sm text-ink/55">{STEP_COPY[step]}</p>

      {step === STEPS.EMAIL && (
        <>
          <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="mt-8 space-y-6">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={fieldClass}
                {...emailForm.register('email', { required: 'Email is required' })}
              />
              {emailForm.formState.errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              className="flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
            >
              {emailForm.formState.isSubmitting ? 'Sending code…' : 'Continue'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink/10" />
            <span className="font-body text-xs text-ink/40">OR</span>
            <div className="h-px flex-1 bg-ink/10" />
          </div>

          <GoogleLoginButton />
        </>
      )}

      {step === STEPS.OTP && (
        <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="mt-8 space-y-6">
          <div>
            <label className={labelClass}>Verification code</label>
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className={fieldClass}
              {...otpForm.register('otp', { required: 'Code is required', minLength: 6, maxLength: 6 })}
            />
            {otpForm.formState.errors.otp && (
              <p className="mt-1.5 text-xs text-red-600">{otpForm.formState.errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={otpForm.formState.isSubmitting}
            className="flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
          >
            {otpForm.formState.isSubmitting ? 'Verifying…' : 'Verify Email'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-center font-body text-sm text-gold"
          >
            {resending ? 'Sending…' : "Didn't get a code? Resend"}
          </button>
          <button
            type="button"
            onClick={() => setStep(STEPS.EMAIL)}
            className="w-full text-center font-body text-sm text-ink/50 hover:text-ink"
          >
            Use a different email
          </button>
        </form>
      )}

      {step === STEPS.DETAILS && (
        <form onSubmit={detailsForm.handleSubmit(handleRegister)} className="mt-8 space-y-6">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              placeholder="Jane Doe"
              className={fieldClass}
              {...detailsForm.register('name', { required: 'Name is required' })}
            />
            {detailsForm.formState.errors.name && (
              <p className="mt-1.5 text-xs text-red-600">{detailsForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Phone (optional)</label>
            <input type="tel" placeholder="+1 555 012 3456" className={fieldClass} {...detailsForm.register('phone')} />
          </div>
          <div className="relative">
            <label className={labelClass}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              className={fieldClass}
              {...detailsForm.register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Must be at least 8 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-7 right-0 text-ink/40 hover:text-ink"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
            {detailsForm.formState.errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{detailsForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="relative">
            <label className={labelClass}>Confirm password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              className={fieldClass}
              {...detailsForm.register('confirmPassword', {
                validate: (value) => value === detailsForm.watch('password') || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute top-7 right-0 text-ink/40 hover:text-ink"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
            {detailsForm.formState.errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-600">{detailsForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={detailsForm.formState.isSubmitting}
            className="flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
          >
            {detailsForm.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center font-body text-sm text-ink/55">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gold">
          Login
        </Link>
      </p>
    </div>
  );
}
