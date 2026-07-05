import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WhatIDo = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        ".services-title",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".whatIDO",
            start: "top 80%",
          }
        }
      );

      // Grid cards animation with stagger
      gsap.fromTo(
        ".service-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 85%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="whatIDO" id="services" ref={sectionRef}>
      <div className="services-container">
        <h2 className="services-title">
          What <span>I Offer</span>
        </h2>
        <p className="services-intro">
          High-performance, secure, and smart digital experiences tailored to solve complex modern challenges.
        </p>
        
        <div className="services-grid">
          {config.services.map((service, index) => {
            const isCyan = index % 2 === 0;
            return (
              <div 
                key={index} 
                className={`service-card ${isCyan ? 'service-cyan' : 'service-yellow'}`}
                data-cursor="disable"
              >
                <div className="service-icon-bg">
                  <span className="service-emoji">{service.icon}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-card-glow"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;
