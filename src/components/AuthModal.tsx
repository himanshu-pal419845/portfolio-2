import React from "react";
import { FaGoogle, FaXTwitter, FaFacebookF } from "react-icons/fa6";
import { MdClose } from "react-icons/md";
import { supabase } from "../utils/supabaseClient";
import "./styles/AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSocialLogin = async (provider: "google" | "twitter" | "facebook") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error logging in with ${provider}:`, error.message);
      alert(`Login failed: ${error.message}. Please configure OAuth keys in Supabase.`);
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
          <p>Sign in using your social account to direct message Himanshu and share files in real-time.</p>
        </div>

        <div className="auth-buttons-grid">
          <button 
            className="auth-btn google-btn" 
            onClick={() => handleSocialLogin("google")}
            data-cursor="disable"
          >
            <FaGoogle /> Connect with Google
          </button>

          <button 
            className="auth-btn twitter-btn" 
            onClick={() => handleSocialLogin("twitter")}
            data-cursor="disable"
          >
            <FaXTwitter /> Connect with X / Twitter
          </button>

          <button 
            className="auth-btn facebook-btn" 
            onClick={() => handleSocialLogin("facebook")}
            data-cursor="disable"
          >
            <FaFacebookF /> Connect with Facebook
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
