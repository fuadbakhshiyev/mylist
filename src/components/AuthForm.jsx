import React, { useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { AuthError, useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateField = (field, values, isSignup) => {
  if (field === 'name' && isSignup) {
    if (!values.name.trim()) return 'Enter a name to show on your profile.';
    if (values.name.trim().length > 40) return 'Use 40 characters or fewer.';
  }
  if (field === 'email') {
    if (!values.email.trim()) return 'Enter your email address.';
    if (!EMAIL_PATTERN.test(values.email.trim())) return 'Enter a valid email, like name@example.com.';
  }
  if (field === 'password') {
    if (!values.password) return 'Enter your password.';
    if (isSignup && values.password.length < 8) return 'Use at least 8 characters.';
  }
  return '';
};

const AuthForm = ({ mode, reason, titleId, onModeChange, onSuccess }) => {
  const { logIn, signUp } = useAuth();
  const uid = useId();
  const isSignup = mode === 'signup';
  const fields = isSignup ? ['name', 'email', 'password'] : ['email', 'password'];

  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [emailTaken, setEmailTaken] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = { name: useRef(null), email: useRef(null), password: useRef(null) };

  // Switching between log in and sign up keeps what was typed but clears old errors
  useEffect(() => {
    setErrors({});
    setEmailTaken(false);
    setFormError('');
  }, [mode]);

  const handleChange = (field) => (e) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
    if (field === 'email') setEmailTaken(false);
  };

  const handleBlur = (field) => () => {
    // Only report problems once something was typed; empty fields are checked on submit
    if (!values[field]) return;
    setErrors(prev => ({ ...prev, [field]: validateField(field, values, isSignup) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const nextErrors = Object.fromEntries(fields.map(field => [field, validateField(field, values, isSignup)]));
    setErrors(nextErrors);
    const firstInvalid = fields.find(field => nextErrors[field]);
    if (firstInvalid) {
      inputRefs[firstInvalid].current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const user = isSignup
        ? await signUp({ name: values.name, email: values.email, password: values.password })
        : await logIn({ email: values.email, password: values.password });
      onSuccess?.(user);
    } catch (err) {
      if (err instanceof AuthError && err.code === 'EMAIL_TAKEN') {
        setEmailTaken(true);
        inputRefs.email.current?.focus();
      } else if (err instanceof AuthError && err.code === 'INVALID_CREDENTIALS') {
        setFormError("That email and password don't match. Try again.");
      } else {
        setFormError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errorId = (field) => `${uid}-${field}-error`;

  const renderInput = (field, label, type, autoComplete, extraLabel = null) => {
    const hasError = Boolean(errors[field]) || (field === 'email' && emailTaken);
    return (
      <div className="auth-field">
        <div className="auth-label-row">
          <label htmlFor={`${uid}-${field}`}>{label}</label>
          {extraLabel}
        </div>
        <input
          id={`${uid}-${field}`}
          ref={inputRefs[field]}
          type={type}
          autoComplete={autoComplete}
          className="auth-input"
          value={values[field]}
          onChange={handleChange(field)}
          onBlur={handleBlur(field)}
          readOnly={submitting}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId(field) : undefined}
        />
        {field === 'email' && emailTaken ? (
          <p id={errorId(field)} className="auth-error">
            An account with this email already exists.{' '}
            <button type="button" className="auth-inline-link" onClick={() => onModeChange('login')}>Log in instead</button>
          </p>
        ) : errors[field] ? (
          <p id={errorId(field)} className="auth-error">{errors[field]}</p>
        ) : null}
      </div>
    );
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 id={titleId} className="auth-title">{isSignup ? 'Create your account' : 'Log in'}</h2>
      <p className="auth-subtitle">
        {reason || (isSignup ? 'Track every MCU title you watch.' : 'Welcome back. Pick up where you left off.')}
      </p>

      {formError && <div className="auth-banner" role="alert">{formError}</div>}

      {isSignup && renderInput('name', 'Name', 'text', 'name')}
      {renderInput('email', 'Email', 'email', 'email')}
      {renderInput(
        'password',
        'Password',
        showPassword ? 'text' : 'password',
        isSignup ? 'new-password' : 'current-password',
        <button type="button" className="auth-inline-link" onClick={() => setShowPassword(v => !v)}>
          {showPassword ? 'Hide' : 'Show'}
        </button>
      )}

      {isSignup && (
        <p className={`auth-check ${values.password.length >= 8 ? 'met' : ''}`}>
          <Check size={14} strokeWidth={3} aria-hidden="true" /> At least 8 characters
        </p>
      )}

      <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
        {submitting ? (isSignup ? 'Creating account…' : 'Logging in…') : (isSignup ? 'Create account' : 'Log in')}
      </button>

      <p className="auth-note">Your account and lists are saved in this browser only.</p>

      <p className="auth-switch">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button" className="auth-inline-link" onClick={() => onModeChange(isSignup ? 'login' : 'signup')}>
          {isSignup ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;
