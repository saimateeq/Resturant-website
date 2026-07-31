import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { userService } from '@services/userService';
import { setCredentials } from '@redux/slices/authSlice';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function Profile() {
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar?.url || '');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (formData) => {
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone || '');
      if (avatarFile) payload.append('avatar', avatarFile);

      const { data } = await userService.updateProfile(payload);
      dispatch(setCredentials({ user: data.data.user, accessToken }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    }
  };

  return (
    <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
      <h1 className="font-display text-xl font-semibold text-secondary-900 dark:text-secondary-50">
        Profile
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-secondary-100 dark:bg-secondary-800">
            {preview && <img src={preview} alt="Avatar" className="h-full w-full object-cover" />}
          </div>
          <label className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400">
            Change photo
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <Input label="Full name" {...register('name', { required: true })} />
        <Input label="Email" value={user?.email} disabled className="opacity-60" />
        <Input label="Phone" {...register('phone')} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
