import { PropsWithChildren, useEffect, useState } from "react";
import "./styles/Landing.css";
import { config } from "../config";
import { lenis } from "./Navbar";

const TITLES = [
  "AI Engineer",
  "Cybersecurity Specialist",
  "Full Stack Developer",
  "Freelancer",
  "Generative AI Learner"
];

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  // Typing animation state
  const [currentText, setCurrentText] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: any;
    const fullText = TITLES[titleIndex];

    const handleType = () => {
      if (!isDeleting) {
        // Typing
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(100);

        if (currentText === fullText) {
          // Pause before deleting
          timer = setTimeout(() => setIsDeleting(true), 2000);
          return;
        }
      } else {
        // Deleting
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(50);

        if (currentText === "") {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % TITLES.length);
          return;
        }
      }

      timer = setTimeout(handleType, typingSpeed);
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, titleIndex, typingSpeed]);

  const scrollToSection = (id: string) => {
    if (lenis) {
      const target = document.querySelector(id) as HTMLElement;
      if (target) {
        lenis.scrollTo(target, { duration: 1.5 });
      }
    } else {
      const target = document.querySelector(id);
      target?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
            
            {/* Action buttons requested in Hero section */}
            <div className="landing-buttons">
              <button 
                onClick={() => scrollToSection("#contact")} 
                className="hero-btn primary-glow"
                data-cursor="disable"
              >
                Hire Me
              </button>
              <button 
                onClick={() => scrollToSection("#work")} 
                className="hero-btn secondary-glow"
                data-cursor="disable"
              >
                View Projects
              </button>
              <a 
                href="#contact" 
                className="hero-btn outline-glow"
                data-cursor="disable"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("#contact");
                }}
              >
                Contact Me
              </a>
              <a 
                href="/resume.png" 
                download="Himanshu_Pal_Resume.png"
                className="hero-btn resume-glow"
                data-cursor="disable"
              >
                Download Resume
              </a>
            </div>
          </div>
          <div className="landing-info">
            <h3>I AM A</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1 typing-cursor">{currentText}</div>
            </h2>
            <h2>
              <div className="landing-h2-info">Building Secure AI Solutions</div>
            </h2>
          </div>
          {/* Mobile photo - shows only on mobile when 3D character is hidden */}
          <div className="mobile-photo">
            <img src="/images/mypicnbg.png" alt="Himanshu Pal" />
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
