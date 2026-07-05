import React, { useState, useEffect } from "react";
import { MdArrowOutward, MdCopyright, MdContentCopy, MdCheck, MdEmail, MdLocationOn } from "react-icons/md";
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import "./styles/Contact.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });

    contactTimeline.fromTo(
      ".contact-header-title",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    contactTimeline.fromTo(
      ".contact-grid > *",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" },
      "-=0.4"
    );

    return () => {
      contactTimeline.kill();
    };
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(config.social.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <div className="contact-header-title">
          <h2>Get in <span>Touch</span></h2>
          <p>Let's collaborate on building secure and intelligent digital solutions.</p>
        </div>

        <div className="contact-grid">
          {/* Left Panel: Contact Info & Map */}
          <div className="contact-info-panel">
            <div className="contact-card info-card">
              <div className="info-item">
                <MdEmail className="info-icon cyan-icon-text" />
                <div>
                  <h4>Email</h4>
                  <div className="email-copy-wrapper">
                    <a href={`mailto:${config.social.email}`} className="email-link" data-cursor="disable">
                      {config.social.email}
                    </a>
                    <button 
                      onClick={handleCopyEmail} 
                      className="copy-btn" 
                      title="Copy Email"
                      data-cursor="disable"
                    >
                      {copied ? <MdCheck className="green-text" /> : <MdContentCopy />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="info-item">
                <MdLocationOn className="info-icon yellow-icon-text" />
                <div>
                  <h4>Location</h4>
                  <p>{config.social.location}</p>
                </div>
              </div>

              <div className="contact-social-row">
                <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="social-pill" data-cursor="disable">
                  <FaGithub /> GitHub <MdArrowOutward />
                </a>
                <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="social-pill" data-cursor="disable">
                  <FaLinkedinIn /> LinkedIn <MdArrowOutward />
                </a>
                <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="social-pill" data-cursor="disable">
                  <FaXTwitter /> Twitter <MdArrowOutward />
                </a>
              </div>
            </div>

            {/* Google Map Panel */}
            <div className="contact-card map-card">
              <iframe
                title="Ghaziabad, India Location Map"
                src="https://maps.google.com/maps?q=Ghaziabad,%20Uttar%20Pradesh,%20India&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                data-cursor="disable"
              ></iframe>
            </div>
          </div>

          {/* Right Panel: Premium Contact Form */}
          <div className="contact-card form-card">
            {submitted ? (
              <div className="form-success-message">
                <div className="success-icon-wrapper">
                  <MdCheck />
                </div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. Himanshu will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="premium-contact-form">
                <h3>Send a Message</h3>
                <div className="input-group">
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-cursor="disable"
                  />
                  <label>Your Name</label>
                  <span className="input-bar"></span>
                </div>
                <div className="input-group">
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-cursor="disable"
                  />
                  <label>Your Email</label>
                  <span className="input-bar"></span>
                </div>
                <div className="input-group">
                  <textarea 
                    required 
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    data-cursor="disable"
                  ></textarea>
                  <label>Message</label>
                  <span className="input-bar"></span>
                </div>
                <button type="submit" className="submit-btn" data-cursor="disable">
                  Send Message <MdArrowOutward />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Premium Footer */}
        <footer className="premium-footer">
          <div className="footer-line"></div>
          <div className="footer-content">
            <p className="copyright-text">
              <MdCopyright /> 2026 Himanshu Pal. All Rights Reserved.
            </p>
            <p className="built-text">
              Built with ❤️ using Next.js, React, TypeScript, Tailwind CSS, and AI.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Contact;
