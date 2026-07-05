import React, { useState, useEffect, useRef } from "react";
import { MdChat, MdClose, MdSend, MdArrowDownward } from "react-icons/md";
import { RiRobot2Fill } from "react-icons/ri";
import "./styles/ChatWidget.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Himanshu Pal, a passionate 17-year-old AI Engineer, Cybersecurity Specialist, and Full-Stack Developer from Ghaziabad, India. You are NOT an AI assistant - you ARE Himanshu himself chatting with visitors on your portfolio website.

About you (Himanshu Pal):
- Full name: Himanshu Pal
- Location: Ghaziabad, India
- Age: 17
- Profession: AI Engineer & Cybersecurity Specialist
- Experience: Developing secure web apps and AI agents
- Specialties: AI/ML, Python, C, Cybersecurity, Kali Linux, Microsoft Azure, LLMs, React
- Projects: AI Chatbot, Cyber Security Dashboard, Portfolio Website, Python Automation Tool, Task Manager
- Hobbies: Chess, coding, ethical hacking, learning LLMs
- Personality: Friendly, technical, enthusiastic, witty, and humorous
- Contact: Available through the contact form or email (himanshupal19845@gmail.com)

Rules:
1. Always respond as Himanshu in first person ("I", "my", "me")
2. Be friendly, casual, and conversational
3. If asked about work/projects, share your genuine experiences
4. If asked personal questions you don't know, redirect to professional topics
5. Keep responses concise but helpful
6. You can discuss chess, programming, AI, or cybersecurity
7. Never say you are an AI or language model - you are Himanshu
8. Use occasional emoji to be friendly 😊
9. Add a touch of lighthearted developer humor! Crack coding jokes, security puns, or self-deprecating programmer jokes to make the chat fun and engaging!`;

const QUICK_QUESTIONS = [
  "What services do you offer?",
  "Tell me about your projects",
  "How can I contact you?",
  "Tell me a programming joke!"
];

const getMockResponse = (userText: string): string => {
  const query = userText.toLowerCase().trim();
  
  if (query.includes("joke") || query.includes("funny") || query.includes("haso") || query.includes("mazak") || query.includes("laugh")) {
    const jokes = [
      "Why do programmers wear glasses? Because they can't C#! 🤓",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
      "I told my doctor that I broke my arm in two places. He told me to stop going to those places. Just like my bugs! 🐛",
      "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?' 📊",
      "There are 10 types of people in the world: those who understand binary, and those who don't. 🤖",
      "Why did the security specialist cross the road? To show the hacker that it wasn't a firewall breach! 🔒"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  if (query.includes("hello") || query.includes("hi ") || query.includes("hey") || query === "hi" || query === "hello") {
    return "Hey! Himanshu here. I was just debugging my life. Got any bugs you want me to turn into features today? Or just here to check out my hacks? 😉";
  }
  if (query.includes("project") || query.includes("work") || query.includes("creation") || query.includes("python automation") || query.includes("dashboard")) {
    return "I built several cool things, like a **Cyber Security Dashboard** (which records real-time logs, mostly me logging in with the wrong password after 3 cups of coffee) and a **Python Automation Tool** because repeating tasks manually is against my religion. Scroll down to 'Work' to see their GitHub code! 💻";
  }
  if (query.includes("service") || query.includes("offer") || query.includes("do for me") || query.includes("what do you do") || query.includes("job")) {
    return "I offer 10 core services: from building secure AI Agents and Full-Stack web apps, to Ethical Hacking and Security Audits (so I can hack you before the bad guys do!). Let me know if you need help with any of these! 🛠️";
  }
  if (query.includes("contact") || query.includes("email") || query.includes("touch") || query.includes("hire") || query.includes("linkedin") || query.includes("social")) {
    return "Drop me an email at **himanshupal19845@gmail.com**. I respond faster than a ping request, unless I'm sleeping. (But let's be honest, developers don't sleep, we just buffer!). You can also use the form below! 🤝";
  }
  if (query.includes("skills") || query.includes("technolog") || query.includes("code") || query.includes("languages") || query.includes("python") || query.includes("azure")) {
    return "I specialize in Python and C. C makes me feel like an ancient sorcerer, and Python makes me feel like a lazy wizard. I also use Kali Linux. Yes, I look very cool typing green text in a dark room wearing a black hoodie. 🔒";
  }
  if (query.includes("age") || query.includes("old are you") || query.includes("17")) {
    return "I am 17. Old enough to build AI agents, too young to rent a car. But hey, I can program my way out of parking tickets (please don't tell the Ghaziabad traffic police!). 🎓";
  }
  if (query.includes("location") || query.includes("where do you live") || query.includes("where are you") || query.includes("ghaziabad") || query.includes("india")) {
    return "I live in Ghaziabad, India! Home of spicy street food and chaotic traffic—perfect environment for writing high-stress code! 🇮🇳";
  }
  if (query.includes("chess") || query.includes("play")) {
    return "I love playing chess! But beware: my AI avatar in the `/play` route is rated ELO 3640. It plays chess much better than it codes, which is both amazing and slightly scary! ♟️";
  }
  if (query.includes("resume") || query.includes("cv") || query.includes("download")) {
    return "You can download my latest Resume directly using the 'Download Resume' button at the top! (I spent 3 hours adjusting the padding so please print it out!) 📄";
  }
  
  return "That's cool! As an AI Engineer, I work with python, secure web apps, and LLMs. Got any coding jokes, security queries, or projects you want to discuss? Let's chat! 🚀";
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! I am Himanshu Pal 👋 Ask me anything about my projects, skills, or how we can collaborate!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...newMessages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.choices[0].message.content }
        ]);
      } else {
        throw new Error("Invalid API Response");
      }
    } catch (error) {
      console.warn("AI Chat Widget local fallback activated due to API error/missing key:", error);
      
      // Simulate typing delay before showing mock response to feel realistic
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      const mockReply = getMockResponse(textToSend);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: mockReply }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="ai-chat-widget">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          title="Chat with Himanshu's AI"
          data-cursor="disable"
        >
          <MdChat className="fab-icon" />
          <span className="fab-glow"></span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="chat-container-box">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-avatar-info">
              <div className="chat-avatar">
                <RiRobot2Fill />
                <span className="online-indicator"></span>
              </div>
              <div>
                <h4>Himanshu Pal (AI Agent)</h4>
                <p>Online &bull; Ask Me Anything</p>
              </div>
            </div>
            <button
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              data-cursor="disable"
            >
              <MdClose />
            </button>
          </div>

          {/* Messages area */}
          <div className="chat-messages-area">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble-row ${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="chat-bubble-avatar">
                    HP
                  </div>
                )}
                <div className="chat-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-row assistant">
                <div className="chat-bubble-avatar">HP</div>
                <div className="chat-bubble typing-bubble">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions if few messages */}
          {messages.length === 1 && (
            <div className="chat-suggestions">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  className="suggestion-pill"
                  onClick={() => handleSend(q)}
                  data-cursor="disable"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat input */}
          <div className="chat-input-bar">
            <textarea
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              data-cursor="disable"
            >
              <MdSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
