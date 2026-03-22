import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-magenta-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
}