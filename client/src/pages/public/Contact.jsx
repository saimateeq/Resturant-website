import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { publicService } from '@services/publicService';
import { useSEO } from '@hooks/useSEO';
import cn from '@utils/cn';

const fieldClass =
  'w-full border-b border-ink/15 bg-transparent px-0 py-2.5 font-body text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-gold';
const labelClass = 'mb-1.5 block font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase';

const CONTACT_DETAILS = [
  { icon: FiMapPin, label: 'Address', value: '123 Gourmet Street, Flavor City, FC 10001' },
  { icon: FiPhone, label: 'Phone', value: '+1 (555) 012-3456' },
  { icon: FiMail, label: 'Email', value: 'hello@savoria.com' },
];

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
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="eyebrow">Get in Touch</span>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 font-body text-sm text-ink/60">
            Questions, feedback, or private events — we'd love to hear from you.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
          <Reveal className="space-y-5 lg:col-span-2">
            {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="border border-ink/10 p-6">
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 text-gold" />
                  <div>
                    <p className="font-body text-sm font-medium text-ink">{label}</p>
                    <p className="mt-0.5 font-body text-sm text-ink/55">{value}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border border-ink/10 p-6">
              <div className="flex items-start gap-3">
                <FiClock className="mt-0.5 text-gold" />
                <div>
                  <p className="font-body text-sm font-medium text-ink">Working Hours</p>
                  <p className="mt-0.5 font-body text-sm text-ink/55">Mon–Fri: 11:00 AM – 10:00 PM</p>
                  <p className="font-body text-sm text-ink/55">Sat–Sun: 10:00 AM – 11:00 PM</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label="Social media"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="border border-ink/10 p-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full name</label>
                  <input className={fieldClass} {...register('name', { required: 'Name is required' })} />
                  {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    className={fieldClass}
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Phone (optional)</label>
                  <input className={fieldClass} {...register('phone')} />
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <input className={fieldClass} {...register('subject')} />
                </div>
              </div>
              <div className="mt-6">
                <label className={labelClass}>Message</label>
                <textarea
                  rows={5}
                  {...register('message', { required: true })}
                  className={cn(fieldClass, 'resize-none')}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 inline-flex min-h-[44px] items-center justify-center border border-ink bg-ink px-7 font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
              >
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-16 h-[400px] overflow-hidden border border-ink/10">
          <iframe
            title="Savoria location"
            src="https://maps.google.com/maps?q=New%20York%2C%20NY&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="h-full w-full border-0 grayscale-[20%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </div>
  );
}
