import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { publicService } from '@services/publicService';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { useSEO } from '@hooks/useSEO';

export default function Contact() {
  useSEO({
    title: 'Contact Us',
    description: 'Get in touch with Savoria — visit us, call, email, or send a message directly.',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const { data } = await publicService.submitContact(formData);
      toast.success(data.message);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send your message');
    }
  };

  return (
    <div className="container-app py-16">
      <Reveal className="text-center">
        <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">Contact Us</h1>
        <p className="mt-3 text-secondary-500 dark:text-secondary-400">
          Questions, feedback, or private events — we'd love to hear from you.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <Reveal className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
            <div className="flex items-start gap-3">
              <FiMapPin className="mt-0.5 text-primary-500" />
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">Address</p>
                <p className="text-sm text-secondary-500">123 Gourmet Street, Flavor City, FC 10001</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
            <div className="flex items-start gap-3">
              <FiPhone className="mt-0.5 text-primary-500" />
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">Phone</p>
                <p className="text-sm text-secondary-500">+1 (555) 012-3456</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
            <div className="flex items-start gap-3">
              <FiMail className="mt-0.5 text-primary-500" />
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">Email</p>
                <p className="text-sm text-secondary-500">hello@savoria.com</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
            <div className="flex items-start gap-3">
              <FiClock className="mt-0.5 text-primary-500" />
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">Working Hours</p>
                <p className="text-sm text-secondary-500">Mon–Fri: 11:00 AM – 10:00 PM</p>
                <p className="text-sm text-secondary-500">Sat–Sun: 10:00 AM – 11:00 PM</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {[FiInstagram, FiFacebook, FiTwitter].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                aria-label="Social media"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-500/10 text-secondary-600 transition-colors hover:bg-primary-500 hover:text-white dark:text-secondary-300"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-3">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-secondary-500/10 bg-white p-8 dark:bg-secondary-900"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone (optional)" {...register('phone')} />
              <Input label="Subject" {...register('subject')} />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Message
              </label>
              <textarea
                rows={5}
                {...register('message', { required: true })}
                className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-50"
              />
            </div>
            <Button type="submit" className="mt-6" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </Button>
          </form>
        </Reveal>
      </div>

      <Reveal delay={0.2} className="mt-16 h-[400px] overflow-hidden rounded-3xl">
        <iframe
          title="Savoria location"
          src="https://maps.google.com/maps?q=New%20York%2C%20NY&t=&z=13&ie=UTF8&iwloc=&output=embed"
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Reveal>
    </div>
  );
}
