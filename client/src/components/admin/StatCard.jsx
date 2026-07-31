import { motion } from 'framer-motion';
import { useCountUp } from '@hooks/useCountUp';
import cn from '@utils/cn';

const ACCENT_CLASSES = {
  primary: 'bg-primary-500/10 text-primary-500',
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-green-500/10 text-green-500',
  amber: 'bg-amber-500/10 text-amber-500',
  purple: 'bg-purple-500/10 text-purple-500',
};

export default function StatCard({ label, value, icon: Icon, prefix = '', suffix = '', accent = 'primary' }) {
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-secondary-500/10 bg-white p-5 dark:bg-secondary-900"
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', ACCENT_CLASSES[accent])}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-2xl font-bold text-secondary-900 dark:text-secondary-50">
        {prefix}
        {animated.toLocaleString(undefined, { maximumFractionDigits: prefix === '$' ? 2 : 0 })}
        {suffix}
      </p>
      <p className="text-sm text-secondary-500">{label}</p>
    </motion.div>
  );
}
