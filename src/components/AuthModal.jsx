import React from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import AuthForm from './AuthForm';

// Login window opened by actions that need an account (e.g. a guest tapping a card button)
const AuthModal = () => {
  const { authPrompt, openAuth, closeAuth } = useAuth();
  if (!authPrompt) return null;

  return (
    <Modal onClose={closeAuth} labelledBy="auth-modal-title" maxWidth={420}>
      <AuthForm
        mode={authPrompt.mode}
        reason={authPrompt.reason}
        titleId="auth-modal-title"
        onModeChange={(mode) => openAuth(mode, authPrompt.reason)}
        onSuccess={closeAuth}
      />
    </Modal>
  );
};

export default AuthModal;
