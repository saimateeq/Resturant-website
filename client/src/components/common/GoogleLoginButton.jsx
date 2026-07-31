import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { USER_ROLES } from '@constants';

const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];

export default function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) return null;

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const { user } = await googleLogin(credentialResponse.credential);
            toast.success('Welcome!');
            navigate(ADMIN_ROLES.includes(user?.role) ? '/admin' : '/dashboard');
          } catch {
            toast.error('Google sign-in failed');
          }
        }}
        onError={() => toast.error('Google sign-in failed')}
      />
    </div>
  );
}
