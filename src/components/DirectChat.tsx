import React, { useState, useEffect, useRef } from "react";
import { MdSend, MdAttachFile, MdClose, MdLogout, MdLock } from "react-icons/md";
import { FaFileArchive, FaFilePdf, FaVideo } from "react-icons/fa";
import { supabase } from "../utils/supabaseClient";
import AuthModal from "./AuthModal";
import "./styles/DirectChat.css";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
}

interface DBMessage {
  id: string;
  sender_id: string;
  text: string;
  media_url?: string;
  media_type?: string;
  file_name?: string;
  receiver_id?: string;
  created_at: string;
  profiles?: Profile; // Joined profile
}

const DirectChat = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile(data);
      } else {
        // Create profile if doesn't exist
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url || "",
          email: user.email || "",
        };
        const { error: insertError } = await supabase.from("profiles").upsert(newProfile);
        if (insertError) throw insertError;
        setProfile(newProfile);
      }
    } catch (err) {
      console.error("Error fetching/creating profile:", err);
    }
  };

  // Fetch messages and subscribe to real-time updates
  useEffect(() => {
    if (!session?.user) return;

    // Fetch historical messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("direct_messages")
        .select(`
          id, sender_id, text, media_url, media_type, file_name, receiver_id, created_at,
          profiles ( id, full_name, avatar_url, email )
        `)
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching messages:", error.message);
      } else if (data) {
        setMessages(data as unknown as DBMessage[]);
        setTimeout(scrollToBottom, 200);
      }
    };

    fetchMessages();

    // Subscribe to realtime changes in direct_messages
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        async (payload) => {
          const newMessage = payload.new as DBMessage;
          
          if (newMessage.sender_id !== session.user.id && newMessage.receiver_id !== session.user.id) {
            return;
          }

          // Fetch sender profile details to join locally
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMessage.sender_id)
            .single();

          const messageWithProfile: DBMessage = {
            ...newMessage,
            profiles: senderProfile || undefined,
          };

          // Prevent duplicates from optimistic UI
          setMessages((prev) => {
            const isDuplicate = prev.some(m => m.id === newMessage.id || (m.id.startsWith('temp-') && m.text === newMessage.text && m.sender_id === newMessage.sender_id));
            if (isDuplicate) {
              // Replace temp message with real one
              return prev.map(m => (m.id.startsWith('temp-') && m.text === newMessage.text) ? messageWithProfile : m);
            }
            return [...prev, messageWithProfile];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Generate previews for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;
    if (!session?.user || !profile) return;

    setIsSending(true);
    let mediaUrl = "";
    let mediaType = "";
    let fileName = "";

    try {
      // 1. Upload File if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const path = `${profile.id}/${Date.now()}.${fileExt}`;
        fileName = selectedFile.name;

        if (selectedFile.type.startsWith("image/")) mediaType = "image";
        else if (selectedFile.type.startsWith("video/")) mediaType = "video";
        else mediaType = "file";

        setUploadProgress(10); // Start progress bar simulation/initialization

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(path, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("chat-attachments")
            .getPublicUrl(path);

          mediaUrl = urlData?.publicUrl || "";
        }
        setUploadProgress(100);
      }

      // Detect links in text if media_type is not already set
      if (!mediaType && (text.includes("http://") || text.includes("https://"))) {
        mediaType = "link";
      }

      const textToInsert = text;

      const optimisticMsg: DBMessage = {
        id: `temp-${Date.now()}`,
        sender_id: profile.id,
        text,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
        file_name: fileName || undefined,
        created_at: new Date().toISOString(),
        profiles: profile,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setTimeout(scrollToBottom, 100);
      setText("");
      handleClearFile();

      // 2. Insert Message into Database
      const { error: insertError } = await supabase.from("direct_messages").insert({
        sender_id: profile.id,
        receiver_id: null, // Sending to admin
        text: textToInsert,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
        file_name: fileName || undefined,
      });

      if (insertError) throw insertError;

    } catch (err: any) {
      console.error("Message send failed:", err.message);
      alert(`Message send failed: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const renderMedia = (msg: DBMessage) => {
    if (!msg.media_url) return null;

    switch (msg.media_type) {
      case "image":
        return (
          <div className="message-media-wrapper">
            <img src={msg.media_url} alt="Attachment" className="message-image" onClick={() => window.open(msg.media_url, "_blank")} />
          </div>
        );
      case "video":
        return (
          <div className="message-media-wrapper">
            <video src={msg.media_url} controls className="message-video" />
          </div>
        );
      case "file":
        return (
          <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="message-file-link">
            {msg.file_name?.endsWith(".pdf") ? <FaFilePdf className="pdf-icon" /> : <FaFileArchive className="archive-icon" />}
            <span>{msg.file_name || "Download File"}</span>
          </a>
        );
      default:
        return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="direct-chat-container">
      {/* If Not Authenticated */}
      {!session?.user ? (
        <div className="direct-chat-lockscreen">
          <div className="lockscreen-glow"></div>
          <MdLock className="lock-icon" />
          <h3>HP Secure <span>Direct Message</span></h3>
          <p>Login using your Google account to connect in real-time. Share logs, screenshots, video walkthroughs, or code files directly with Himanshu.</p>
          <button 
            className="lockscreen-login-btn" 
            onClick={() => setIsAuthOpen(true)}
            data-cursor="disable"
          >
            Sign In / Sign Up
          </button>
        </div>
      ) : (
        /* If Authenticated */
        <div className="direct-chat-active">
          {/* Header Profile Row */}
          <div className="direct-chat-user-header">
            <div className="user-profile-info">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  {profile?.full_name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <h5>{profile?.full_name}</h5>
                <span className="auth-indicator">Authenticated</span>
              </div>
            </div>
            <button 
              className="sign-out-btn" 
              onClick={handleSignOut} 
              title="Sign Out"
              data-cursor="disable"
            >
              <MdLogout />
            </button>
          </div>

          {/* Messages Area */}
          <div className="direct-chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages-placeholder">
                <p>No messages yet. Send a direct message to start the conversation! 💬</p>
              </div>
            ) : (
              messages.map((msg) => {
                // Determine if this is an admin reply (if it was sent to us)
                const isAdminReply = msg.receiver_id === session.user.id;
                // It is "me" (visitor) if I sent it to the admin
                const isMe = msg.sender_id === session.user.id && !isAdminReply;
                
                return (
                  <div key={msg.id} className={`direct-message-bubble-row ${isMe ? "me" : "himanshu"}`}>
                    {!isMe && (
                      <div className="chat-bubble-avatar-placeholder">
                        {msg.profiles?.avatar_url ? (
                          <img src={msg.profiles.avatar_url} alt="HP" />
                        ) : (
                          "HP"
                        )}
                      </div>
                    )}
                    <div className="direct-chat-bubble">
                      {!isMe && <span className="sender-name">{msg.profiles?.full_name || "Himanshu"}</span>}
                      {msg.text && <p className="bubble-text">{msg.text}</p>}
                      {renderMedia(msg)}
                      <span className="bubble-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Upload Preview */}
          {selectedFile && (
            <div className="upload-preview-bar">
              <div className="preview-info">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="preview-image-thumbnail" />
                ) : selectedFile.type.startsWith("video/") ? (
                  <FaVideo className="preview-file-icon" />
                ) : (
                  <FaFilePdf className="preview-file-icon" />
                )}
                <div>
                  <span className="preview-file-name">{selectedFile.name}</span>
                  <span className="preview-file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              
              {uploadProgress !== null && (
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              <button className="clear-preview-btn" onClick={handleClearFile} data-cursor="disable">
                <MdClose />
              </button>
            </div>
          )}

          {/* Input Control Area */}
          <form onSubmit={handleSend} className="direct-chat-input-row">
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.zip,.rar,.json,.txt"
            />
            <button 
              type="button" 
              className="chat-action-btn attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach media (Photo, Video, File)"
              data-cursor="disable"
            >
              <MdAttachFile />
            </button>
            
            <textarea
              placeholder="Write a message, share links..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
            />
            
            <button 
              type="submit" 
              className="chat-send-action-btn"
              disabled={isSending || (!text.trim() && !selectedFile)}
              data-cursor="disable"
            >
              <MdSend />
            </button>
          </form>
        </div>
      )}

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default DirectChat;
