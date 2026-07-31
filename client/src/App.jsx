import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@routes/AppRoutes';
import { useTheme } from '@context/ThemeContext';
import { authService } from '@services/authService';
import { userService } from '@services/userService';
import { setCredentials, logout } from '@redux/slices/authSlice';
import { setWishlist } from '@redux/slices/wishlistSlice';

export default function App() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const accessToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!isAuthenticated) return;

    authService
      .getMe()
      .then(({ data }) => dispatch(setCredentials({ user: data.data.user, accessToken })))
      .catch(() => dispatch(logout()));

    userService
      .getWishlist()
      .then(({ data }) => dispatch(setWishlist(data.data.wishlist.map((d) => d._id))))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1f1f23' : '#ffffff',
            color: theme === 'dark' ? '#f3f4f6' : '#17171b',
          },
        }}
      />
    </BrowserRouter>
  );
}
