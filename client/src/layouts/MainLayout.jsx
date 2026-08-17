import { Outlet } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import CustomCursorProvider from '@components/common/CustomCursor';

export default function MainLayout() {
  return (
    <CustomCursorProvider>
      <div className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CustomCursorProvider>
  );
}
