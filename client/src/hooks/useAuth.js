import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@services/authService';
import { userService } from '@services/userService';
import { setCredentials, logout as logoutAction } from '@redux/slices/authSlice';
import { setWishlist, clearWishlist } from '@redux/slices/wishlistSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken } = useSelector((state) => state.auth);

  const hydrateWishlist = () => {
    userService
      .getWishlist()
      .then(({ data }) => dispatch(setWishlist(data.data.wishlist.map((d) => d._id))))
      .catch(() => {});
  };

  const login = async (payload) => {
    const { data } = await authService.login(payload);
    dispatch(setCredentials(data.data));
    hydrateWishlist();
    return data.data;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    dispatch(setCredentials(data.data));
    hydrateWishlist();
    return data.data;
  };

  const googleLogin = async (idToken) => {
    const { data } = await authService.googleLogin(idToken);
    dispatch(setCredentials(data.data));
    hydrateWishlist();
    return data.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logoutAction());
      dispatch(clearWishlist());
      toast.success('Logged out');
      navigate('/login');
    }
  };

  return { user, isAuthenticated, accessToken, login, register, googleLogin, logout };
}
