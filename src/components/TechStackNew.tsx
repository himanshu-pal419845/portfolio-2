import { useEffect, useState } from "react";
import "./styles/TechStackNew.css";

interface SkillItem {
  name: string;
  category: string;
  percentage: number;
  icon: JSX.Element;
  color: "cyan" | "yellow";
}

const skillsData: SkillItem[] = [
  {
    name: "Python",
    category: "Programming",
    percentage: 90,
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M14.25.18c.9 0 1.66.07 2.48.22 1.4.26 2.5 1.13 2.7 2.51.2 1.4.1 2.94.1 4.38v.9h-5.28c-1.16 0-2.2.82-2.2 2v5.33c0 .8-.56 1.44-1.28 1.44H7.07c-1.16 0-2.2-.82-2.2-2v-5.2c0-1.15.82-2.18 2-2.18h7.38v-2.9c0-1.15.83-2.2 2-2.2h3V2.5c0-.85-.68-1.53-1.53-1.53h-3.92C13 .97 12 .98 12 .98s-.8 0-1.48.1c-.8.1-1.4.52-1.74 1.25-.33.72-.3 1.6-.3 2.55v2.9h-1.5c-1.16 0-2.2.82-2.2 2v5.22c0 1.16.82 2.2 2 2.2h1.5v-1.44c0-1.16.82-2.2 2-2.2h5.28c1.16 0 2.2-.82 2.2-2v-5.3c0-.8.56-1.44 1.28-1.44h3.69c1.16 0 2.2.82 2.2 2v5.2c0 1.16-.82 2.2-2 2.2H14.25v1.44c0 1.16-.82 2.2-2 2.2H7.07c-.8 0-1.44-.56-1.44-1.28V12c0-1.16.82-2.2 2-2.2h1.5V6.9c0-1.15.82-2.2 2-2.2h3.9c.8 0 1.44-.56 1.44-1.28V.18z"/>
      </svg>
    )
  },
  {
    name: "C Language",
    category: "Programming",
    percentage: 80,
    color: "yellow",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.84 14.16c-.95.95-2.23 1.48-3.59 1.48-2.8 0-5.08-2.28-5.08-5.08s2.28-5.08 5.08-5.08c1.36 0 2.64.53 3.59 1.48l-1.41 1.41c-.58-.58-1.35-.91-2.18-.91-1.74 0-3.16 1.42-3.16 3.16s1.42 3.16 3.16 3.16c.83 0 1.6-.33 2.18-.91l1.41 1.41z"/>
      </svg>
    )
  },
  {
    name: "Git",
    category: "Development",
    percentage: 85,
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M23.27 11.59L12.41.73a1.64 1.64 0 0 0-2.32 0l-2.2 2.2 3 3a2.43 2.43 0 0 1 1.84 2.37 2.45 2.45 0 0 1-2.45 2.45 2.43 2.43 0 0 1-2.37-1.84l-2.9-2.9v6.86a2.44 2.44 0 0 1 1.84 2.37 2.45 2.45 0 0 1-4.9 0 2.44 2.44 0 0 1 1.84-2.37V9.12a2.44 2.44 0 0 1-1.84-2.37 2.45 2.45 0 0 1 4.9 0 2.44 2.44 0 0 1-1.84 2.37l2.9 2.9a2.42 2.42 0 0 1 1.81-.08l3.77-3.77a2.44 2.44 0 0 1-.08-1.81l-3-3L23.27 9.27a1.64 1.64 0 0 1 0 2.32z"/>
      </svg>
    )
  },
  {
    name: "GitHub",
    category: "Development",
    percentage: 90,
    color: "yellow",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    )
  },
  {
    name: "VS Code",
    category: "Development",
    percentage: 95,
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M23.985 17.56a1.442 1.442 0 0 0-.447-1.02L18.42 12l5.118-4.54a1.442 1.442 0 0 0 .447-1.02.946.946 0 0 0-.17-.55l-2.072-2.87a.936.936 0 0 0-.766-.388.948.948 0 0 0-.623.238L12 9.07 3.666 2.87a.948.948 0 0 0-.623-.238.936.936 0 0 0-.766.388L.205 5.89a.946.946 0 0 0-.17.55 1.442 1.442 0 0 0 .447 1.02L5.58 12 .462 16.54a1.442 1.442 0 0 0-.447 1.02.946.946 0 0 0 .17.55l2.072 2.87c.18.25.467.39.766.39a.948.948 0 0 0 .623-.238L12 14.93l8.334 6.2a.948.948 0 0 0 .623.238c.3 0 .586-.14.766-.39l2.072-2.87a.946.946 0 0 0 .17-.55z"/>
      </svg>
    )
  },
  {
    name: "Kali Linux",
    category: "Cybersecurity",
    percentage: 85,
    color: "yellow",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5zM12 4.5c-4.14 0-7.5 3.36-7.5 7.5S7.86 19.5 12 19.5s7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5z"/>
      </svg>
    )
  },
  {
    name: "ChatGPT (AI)",
    category: "Artificial Intelligence",
    percentage: 95,
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M21.743 12.32a3.707 3.707 0 0 0-.135-2.228 3.738 3.738 0 0 0-1.8-1.921 3.703 3.703 0 0 0-1.127-1.926 3.737 3.737 0 0 0-2.52-1.077 3.69 3.69 0 0 0-1.926-1.134 3.743 3.743 0 0 0-2.673.136c-.846.388-1.52.997-1.92 1.8a3.708 3.708 0 0 0-1.926 1.13 3.738 3.738 0 0 0-1.077 2.52 3.694 3.694 0 0 0-1.134 1.93 3.743 3.743 0 0 0 .136 2.67c.388.847.997 1.52 1.8 1.921a3.707 3.707 0 0 0 1.13 1.925 3.738 3.738 0 0 0 2.52 1.077 3.69 3.69 0 0 0 1.926 1.134 3.743 3.743 0 0 0 2.673-.136c.846-.388 1.52-.997 1.92-1.8a3.708 3.708 0 0 0 1.926-1.13 3.738 3.738 0 0 0 1.077-2.52 3.694 3.694 0 0 0 1.134-1.93 3.743 3.743 0 0 0-.136-2.67zm-8.625 6.671a1.954 1.954 0 0 1-1.272-.472c.032-.016.08-.04.108-.057l3.666-2.115a.559.559 0 0 0 .28-.485v-5.187l1.554.897a.066.066 0 0 1 .035.051v4.256c0 .487-.26.937-.678 1.178l-3.693 2.134zm-5.322-1.97a1.95 1.95 0 0 1-.418-1.29c.02.025.055.07.081.085l3.666 2.116a.559.559 0 0 0 .559 0l4.492-2.593v1.794a.066.066 0 0 1-.01.061l-3.685 2.134a2.385 2.385 0 0 1-2.384 0l-2.301-1.307zM5.56 11.236a1.95 1.95 0 0 1 .854-.997c.012.027.032.073.045.093l1.83 3.17a.559.559 0 0 0 .42.279l5.187.036-1.554.897a.066.066 0 0 1-.05.01v-4.256a2.387 2.387 0 0 1 1.182-2.062l3.694-2.134zm7.25-6.223a1.954 1.954 0 0 1 1.272.472c-.032.016-.08.04-.108.057L9.308 7.657a.559.559 0 0 0-.28.485V13.33L7.474 12.43a.066.066 0 0 1-.035-.051V8.125c0-.488.26-.938.678-1.178l3.693-2.134a1.954 1.954 0 0 1 .998-.2zM7.492 8.783c.02-.025.055-.07.081-.085L11.24 6.582a.559.559 0 0 0 .559 0l4.492 2.593V7.38c0-.022-.004-.044-.01-.06l-3.685-2.135a2.385 2.385 0 0 0-2.384 0L7.91 8.495a1.95 1.95 0 0 0-.418 1.29zm10.948 4a1.95 1.95 0 0 1-.854.997l-.045-.093-1.83-3.17a.559.559 0 0 0-.42-.279L10.104 10.3l1.554-.897a.066.066 0 0 1 .05-.01v4.256c0 .487.26.937.678 1.178l3.694 2.134a2.387 2.387 0 0 1 2.36-.06zm-6.44-1.455v-3.003l2.602 1.502v3.003L12 11.328z"/>
      </svg>
    )
  },
  {
    name: "Microsoft Azure",
    category: "Cloud",
    percentage: 75,
    color: "yellow",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M5.4 19L11 6.2l3.6 7.6L5.4 19zm9.4.2L20 6.6H12l3.6 6.8 4.2-3.6-5 9.4zM2.8 19.8l6.8-15.6h4.6L4.6 20.4H2.8z"/>
      </svg>
    )
  }
];

const TechStackNew = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Delay animation slightly for entrance effect
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="techstack-new" id="skills">
      {/* Video Background */}
      <div className="techstack-video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="techstack-video"
        >
          <source src="/video/video.webm" type="video/webm" />
        </video>
        {/* Dark Overlay */}
        <div className="techstack-overlay"></div>
      </div>

      {/* Content */}
      <div className="techstack-content">
        <h2>My Skills</h2>
        <p className="skills-subtitle">
          Combining Artificial Intelligence, Cybersecurity, and Full Stack Development to build secure, intelligent software.
        </p>
        
        <div className="skills-grid">
          {skillsData.map((skill, index) => (
            <div 
              key={index} 
              className={`skill-card ${skill.color}-glow-border`}
              data-cursor="disable"
            >
              <div className="skill-card-header">
                <div className={`skill-icon ${skill.color}-icon`}>
                  {skill.icon}
                </div>
                <div className="skill-details">
                  <span className="skill-category">{skill.category}</span>
                  <h3 className="skill-name">{skill.name}</h3>
                </div>
                <div className={`skill-percent ${skill.color}-text`}>
                  {skill.percentage}%
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar-fill ${skill.color}-fill`}
                  style={{ width: animate ? `${skill.percentage}%` : '0%' }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStackNew;
