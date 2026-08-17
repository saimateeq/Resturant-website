import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@layouts/MainLayout';
import AuthLayout from '@layouts/AuthLayout';
import AdminLayout from '@layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import Loader from '@components/common/Loader';
import ScrollToTop from '@components/common/ScrollToTop';
import { USER_ROLES } from '@constants';

const Home = lazy(() => import('@pages/public/Home'));
const About = lazy(() => import('@pages/public/About'));
const Menu = lazy(() => import('@pages/public/Menu'));
const DishDetails = lazy(() => import('@pages/public/DishDetails'));
const Gallery = lazy(() => import('@pages/public/Gallery'));
const Reservations = lazy(() => import('@pages/public/Reservations'));
const Cart = lazy(() => import('@pages/public/Cart'));
const Checkout = lazy(() => import('@pages/public/Checkout'));
const Blog = lazy(() => import('@pages/public/Blog'));
const BlogPost = lazy(() => import('@pages/public/BlogPost'));
const Contact = lazy(() => import('@pages/public/Contact'));
const NotFound = lazy(() => import('@pages/public/NotFound'));

const Login = lazy(() => import('@pages/auth/Login'));
const Register = lazy(() => import('@pages/auth/Register'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@pages/auth/ResetPassword'));

const UserDashboard = lazy(() => import('@pages/user/UserDashboard'));
const OrderDetails = lazy(() => import('@pages/user/OrderDetails'));
const AdminDashboard = lazy(() => import('@pages/admin/AdminDashboard'));
const MenuManagement = lazy(() => import('@pages/admin/MenuManagement'));
const OrderManagement = lazy(() => import('@pages/admin/OrderManagement'));
const ReservationManagement = lazy(() => import('@pages/admin/ReservationManagement'));
const CustomerManagement = lazy(() => import('@pages/admin/CustomerManagement'));
const StaffManagement = lazy(() => import('@pages/admin/StaffManagement'));
const InventoryManagement = lazy(() => import('@pages/admin/InventoryManagement'));
const CouponManagement = lazy(() => import('@pages/admin/CouponManagement'));
const ReviewManagement = lazy(() => import('@pages/admin/ReviewManagement'));
const BlogManagement = lazy(() => import('@pages/admin/BlogManagement'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:dishId" element={<DishDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/dashboard/*" element={<UserDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]} />
          }
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="reservations" element={<ReservationManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="blog" element={<BlogManagement />} />

            <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
              <Route path="staff" element={<StaffManagement />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
