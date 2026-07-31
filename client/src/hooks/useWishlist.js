import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '@services/userService';
import { toggleWishlistId } from '@redux/slices/wishlistSlice';

export function useWishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const ids = useSelector((state) => state.wishlist.ids);

  const isWishlisted = (dishId) => ids.includes(dishId);

  const toggle = async (dishId) => {
    if (!isAuthenticated) {
      toast.error('Log in to save favorites');
      navigate('/login');
      return;
    }

    dispatch(toggleWishlistId(dishId));
    try {
      const { data } = await userService.toggleWishlist(dishId);
      toast.success(data.message);
    } catch {
      dispatch(toggleWishlistId(dishId));
      toast.error('Could not update wishlist');
    }
  };

  return { isWishlisted, toggle };
}
