import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-700 transition-colors hover:bg-secondary-500/10 dark:text-secondary-200"
    >
      {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
