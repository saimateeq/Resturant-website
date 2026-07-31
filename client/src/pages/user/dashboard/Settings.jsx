import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userService } from '@services/userService';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function Settings() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await userService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    }
  };

  return (
    <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
      <h1 className="font-display text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Change Password
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-sm space-y-4">
        <Input
          label="Current password"
          type="password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', { required: 'Required' })}
        />
        <Input
          label="New password"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Required',
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />
        <Input
          label="Confirm new password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            validate: (v) => v === watch('newPassword') || 'Passwords do not match',
          })}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
