import React from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

// Only same-origin relative paths are allowed as redirect targets
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : null);

const Auth = ({ mode }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  if (isLoggedIn) return <Navigate to={next || '/profile'} replace />;

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <AuthForm
          mode={mode}
          titleId="auth-page-title"
          onModeChange={(nextMode) => navigate(`/${nextMode}${next ? `?next=${encodeURIComponent(next)}` : ''}`)}
          onSuccess={() => navigate(next || '/profile', { replace: true })}
        />
      </div>
    </div>
  );
};

export default Auth;
