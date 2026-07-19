import React from "react";
import { FaGoogle } from "react-icons/fa6";
import { MdClose } from "react-icons/md";
import { supabase } from "../utils/supabaseClient";
import "./styles/AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error logging in with Google:", error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <MdClose />
        </button>
        
        <div className="auth-modal-header">
          <h3>Welcome to <span>HP Connect</span></h3>
          <p>Sign in with your Google account to direct message Himanshu and share files in real-time.</p>
        </div>

        <div className="auth-buttons-grid">
          <button 
            className="auth-btn google-btn" 
            onClick={handleGoogleLogin}
            data-cursor="disable"
          >
            <FaGoogle /> Sign in with Google
          </button>
        </div>

        <div className="auth-modal-footer">
          <p>By connecting, your public profile name and avatar will be shared securely to send messages.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
