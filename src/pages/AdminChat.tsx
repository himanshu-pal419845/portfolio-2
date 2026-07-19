import React, { useState, useEffect, useRef } from "react";
import { MdSend, MdAttachFile, MdClose, MdLogout, MdLock, MdArrowBack, MdChat } from "react-icons/md";
import { FaGoogle, FaFilePdf } from "react-icons/fa6";
import { FaFileArchive } from "react-icons/fa";
import { supabase } from "../utils/supabaseClient";
import "./styles/AdminChat.css";

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
  profiles?: Profile;
}

interface Conversation {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  lastTime: string;
  messages: DBMessage[];
}

const AdminChat: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auth setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
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
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
          avatar_url: user.user_metadata?.avatar_url || "",
          email: user.email || "",
        };
        await supabase.from("profiles").upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Fetch all messages and subscribe to real-time
  useEffect(() => {
    if (!session?.user) return;

    const fetchAllMessages = async () => {
      const { data, error } = await supabase
        .from("direct_messages")
        .select(`
          id, sender_id, text, media_url, media_type, file_name, receiver_id, created_at,
          profiles ( id, full_name, avatar_url, email )
        `)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error.message);
      } else if (data) {
        setAllMessages(data as unknown as DBMessage[]);
      }
    };

    fetchAllMessages();

    const channel = supabase
      .channel("admin-realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        async (payload) => {
          const newMsg = payload.new as DBMessage;
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMsg.sender_id)
            .single();

          const msgWithProfile: DBMessage = {
            ...newMsg,
            profiles: senderProfile || undefined,
          };

          // Prevent duplicates from optimistic UI
          setAllMessages((prev) => {
            const isDuplicate = prev.some(m => m.id === newMsg.id || (m.id.startsWith('temp-') && m.text === newMsg.text && m.sender_id === newMsg.sender_id));
            if (isDuplicate) {
              return prev.map(m => (m.id.startsWith('temp-') && m.text === newMsg.text) ? msgWithProfile : m);
            }
            return [...prev, msgWithProfile];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Group messages into conversations by sender
  useEffect(() => {
    if (!session?.user || allMessages.length === 0) {
      setConversations([]);
      return;
    }

    const myId = session.user.id;
    const convoMap = new Map<string, Conversation>();

    allMessages.forEach((msg) => {
      // Determine the other party (if admin sent, group by original sender context)
      let otherPartyId = msg.sender_id;

      // If the admin sent the message
      if (msg.sender_id === myId) {
        if (msg.receiver_id) {
          // Admin replying to a visitor
          otherPartyId = msg.receiver_id;
        } else {
          // Admin sending a message from the Visitor UI (testing on same account)
          otherPartyId = myId;
        }
      }

      if (!convoMap.has(otherPartyId)) {
        convoMap.set(otherPartyId, {
          senderId: otherPartyId,
          senderName: msg.profiles?.full_name || "Unknown",
          senderAvatar: msg.profiles?.avatar_url || "",
          lastMessage: msg.text || (msg.media_type ? `📎 ${msg.media_type}` : ""),
          lastTime: msg.created_at,
          messages: [],
        });
      }

      const convo = convoMap.get(otherPartyId)!;
      convo.messages.push(msg);
      convo.lastMessage = msg.text || (msg.media_type ? `📎 ${msg.media_type}` : "");
      convo.lastTime = msg.created_at;
    });

    // We already handled admin messages above by using receiver_id!

    const sorted = Array.from(convoMap.values()).sort(
      (a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
    );

    setConversations(sorted);
  }, [allMessages, session]);

  // Scroll when selected convo changes
  useEffect(() => {
    setTimeout(scrollToBottom, 200);
  }, [selectedConvo, allMessages]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/admin" },
      });
      if (error) throw error;
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const path = `${profile.id}/${Date.now()}.${fileExt}`;
        fileName = selectedFile.name;

        if (selectedFile.type.startsWith("image/")) mediaType = "image";
        else if (selectedFile.type.startsWith("video/")) mediaType = "video";
        else mediaType = "file";

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(path, selectedFile, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;
        if (uploadData) {
          const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
          mediaUrl = urlData?.publicUrl || "";
        }
      }

      if (!mediaType && (text.includes("http://") || text.includes("https://"))) {
        mediaType = "link";
      }

      const textToInsert = text;

      const optimisticMsg: DBMessage = {
        id: `temp-${Date.now()}`,
        sender_id: profile.id,
        receiver_id: selectedConvo || undefined,
        text,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
        file_name: fileName || undefined,
        created_at: new Date().toISOString(),
        profiles: profile,
      };

      setAllMessages((prev) => [...prev, optimisticMsg]);
      setTimeout(scrollToBottom, 100);
      setText("");
      handleClearFile();

      const { error: insertError } = await supabase.from("direct_messages").insert({
        sender_id: profile.id,
        receiver_id: selectedConvo,
        text: textToInsert,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
        file_name: fileName || undefined,
      });

      if (insertError) throw insertError;

    } catch (err: any) {
      alert("Send failed: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const selectedConversation = conversations.find((c) => c.senderId === selectedConvo);

  const renderMedia = (msg: DBMessage) => {
    if (!msg.media_url) return null;
    switch (msg.media_type) {
      case "image":
        return <img src={msg.media_url} alt="Attachment" className="admin-msg-image" onClick={() => window.open(msg.media_url, "_blank")} />;
      case "video":
        return <video src={msg.media_url} controls className="admin-msg-video" />;
      case "file":
        return (
          <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="admin-msg-file-link">
            {msg.file_name?.endsWith(".pdf") ? <FaFilePdf /> : <FaFileArchive />}
            <span>{msg.file_name || "Download"}</span>
          </a>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  // Not logged in
  if (!session?.user) {
    return (
      <div className="admin-chat-page">
        <div className="admin-login-screen">
          <MdLock className="login-icon" />
          <h2>HP <span>Admin</span></h2>
          <p>Sign in to view and reply to all direct messages from your website visitors.</p>
          <button className="admin-google-btn" onClick={handleGoogleLogin}>
            <FaGoogle /> Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-page">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>HP <span>Inbox</span></h3>
          <button className="admin-signout-btn" onClick={handleSignOut} title="Sign Out">
            <MdLogout />
          </button>
        </div>

        <div className="admin-conversations-list">
          {conversations.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#555" }}>
              <MdChat style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>No messages yet.<br />Messages from visitors will appear here.</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <div
                key={convo.senderId}
                className={`admin-convo-item ${selectedConvo === convo.senderId ? "active" : ""}`}
                onClick={() => {
                  setSelectedConvo(convo.senderId);
                  setMobileOpen(true);
                }}
              >
                {convo.senderAvatar ? (
                  <img src={convo.senderAvatar} alt="" className="admin-convo-avatar" />
                ) : (
                  <div className="admin-convo-avatar-placeholder">
                    {convo.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="admin-convo-info">
                  <h5>{convo.senderName}</h5>
                  <p>{convo.lastMessage}</p>
                </div>
                <span className="admin-convo-time">{formatTime(convo.lastTime)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`admin-chat-panel ${mobileOpen ? "open" : ""}`}>
        {!selectedConversation ? (
          <div className="admin-no-chat-selected">
            <MdChat />
            <p>Select a conversation to start replying</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="admin-chat-header">
              <button
                className="admin-chat-back-btn"
                onClick={() => setMobileOpen(false)}
              >
                <MdArrowBack />
              </button>
              {selectedConversation.senderAvatar ? (
                <img src={selectedConversation.senderAvatar} alt="" className="admin-chat-header-avatar" />
              ) : (
                <div className="admin-convo-avatar-placeholder" style={{ width: 40, height: 40, fontSize: 16 }}>
                  {selectedConversation.senderName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="admin-chat-header-info">
                <h4>{selectedConversation.senderName}</h4>
                <span>Visitor</span>
              </div>
            </div>

            {/* Messages */}
            <div className="admin-messages-area">
              {selectedConversation.messages.map((msg) => {
                const isAdmin = msg.sender_id === session.user.id;
                return (
                  <div key={msg.id} className={`admin-msg-row ${isAdmin ? "admin" : "visitor"}`}>
                    <div className="admin-msg-bubble">
                      {msg.text && <p>{msg.text}</p>}
                      {renderMedia(msg)}
                      <span className="admin-msg-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="admin-file-preview">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" />
                ) : (
                  <FaFileArchive style={{ fontSize: 24, color: "#00e5ff" }} />
                )}
                <div className="file-info">
                  <span>{selectedFile.name}</span>
                  <small>{(selectedFile.size / 1024).toFixed(1)} KB</small>
                </div>
                <button className="clear-btn" onClick={handleClearFile}>
                  <MdClose />
                </button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="admin-input-row">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.zip,.rar,.json,.txt"
              />
              <button
                type="button"
                className="admin-attach-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <MdAttachFile />
              </button>
              <textarea
                placeholder="Type a reply..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              <button
                type="submit"
                className="admin-send-btn"
                disabled={isSending || (!text.trim() && !selectedFile)}
              >
                <MdSend />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
