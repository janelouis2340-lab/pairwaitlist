// app/careers/page.tsx
"use client";

import "./careers.css";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function CareersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [submitText, setSubmitText] = useState("Send Application →");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const rolesRef = useRef<HTMLElement | null>(null);

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vis");
          }
        });
      },
      { threshold: 0.1 },
    );

    const elements = document.querySelectorAll(".reveal-careers");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const scrollToRoles = () => {
    rolesRef.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const openModal = (role: string) => {
    setSelectedRole(role);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
    setSubmitText("Send Application →");
    setIsSubmitting(false);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitText("Submitting...");

    const formData = new FormData(e.currentTarget);
    const applicationData = {
      role: selectedRole,
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      work_link: formData.get("work_link") as string,
      reason: formData.get("reason") as string,
    };

    try {
      const { data, error } = await supabase
        .from("applications")
        .insert([applicationData])
        .select();

      if (error) throw error;

      const fullName = formData.get("full_name") as string;
      setSubmittedName(fullName.split(" ")[0]);
      closeModal();

      setTimeout(() => {
        setSuccessModalOpen(true);
      }, 300);
    } catch (error) {
      console.error("Error:", error);
      setSubmitText("❌ Error — please try again");
      setTimeout(() => {
        setSubmitText("Send Application →");
        setIsSubmitting(false);
      }, 3000);
    }
  };

  const roles = [
    {
      title: "Digital Marketer & Designer",
      dept: "Creative & Growth",
      deptClass: "dept-a",
      desc: "You design content that stops the scroll, write copy that converts, and run campaigns that bring real Lagos commuters to us.",
      bullets: [
        "Creates visual content that is clean, original, and unmistakably Lagos",
        "Has run paid social campaigns and can show results in actual signups",
        "Understands what Lagos professionals respond to",
        "Can manage a content calendar and community engagement",
        "Has a strong graphic design eye — mobile-first, brand-consistent",
      ],
    },
    {
      title: "UI / UX Designer",
      dept: "Product & Design",
      deptClass: "dept-b",
      desc: "You design for someone at 6:15am on a budget Android phone who cannot afford friction.",
      bullets: [
        "Has a portfolio of real mobile product work",
        "Designs in Figma and hands off production-ready assets",
        "Thinks about the user in motion, not at a desk",
        "Tests work on low-end devices before calling it done",
        "Cares that it ships correctly, not just that it looks correct",
      ],
    },
    {
      title: "Flutter Developer",
      dept: "Technology",
      deptClass: "dept-c",
      desc: "One codebase. Multiple platforms. A working, tested, payment-integrated mobile app shipping to Lagos commuters.",
      bullets: [
        "Has shipped a real Flutter app to production",
        "Writes clean Dart, manages state properly",
        "Has experience with mobile payment SDK integration",
        "Tests on actual budget Android devices",
        "Delivers working builds on time and communicates clearly",
      ],
    },
  ];

  return (
    <>
      <div className="careers-page">
        {/* ANNOUNCEMENT BANNER */}
        {/* ANNOUNCEMENT BANNER */}
        <div className="banner">
          💼 We're hiring! · <strong>3 roles open</strong> · Apply ↓
        </div>

        {/* Navigation */}
        <nav className="navbar">
          <div className="logo">
            Pair<span>.</span>
          </div>
          <div className="nav-links">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/#how" className="nav-link">
              How it works
            </Link>
            <Link href="/#faq" className="nav-link">
              FAQ
            </Link>
            <Link href="/#signup" className="nav-link">
              Routes
            </Link>
          </div>
          <button onClick={scrollToRoles} className="nav-cta desktop-only">
            Openings →
          </button>

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        >
          <div className="mobile-menu-container">
            <div className="mobile-menu-header">
              <div className="logo">
                pair<span>.</span>
              </div>
              <button
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="mobile-menu-links">
              <Link
                href="/"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>01</span> Home
              </Link>
              <Link
                href="/#how"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>02</span> How it works
              </Link>
              <Link
                href="/#faq"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>03</span> FAQ
              </Link>
              <Link
                href="/#signup"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>04</span> Routes
              </Link>
              <button onClick={scrollToRoles} className="mobile-nav-cta">
                View Openings →
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="careers-hero">
          <div className="careers-hero-content">
            <div className="hero-tag reveal-careers">
              Now Hiring · Lagos, Nigeria
            </div>
            <h1 className="reveal-careers">
              We are solving
              <br />
              <em>Lagos commuting.</em>
            </h1>
            <p className="hero-sub reveal-careers">
              Pair is launching in 2026. We are a small, focused team hiring
              people who want to build something that matters for this city.
            </p>
          </div>
        </section>

        {/* Intro Band */}
        <section className="careers-intro">
          <div className="careers-intro-inner">
            <div className="reveal-careers">
              <div className="section-tag">The opportunity</div>
              <h2 className="section-title">
                Something new.
                <br />
                Something Lagos needs.
              </h2>
              <p>
                8 million people commute in Lagos every day. Most have no good
                option. Pair is changing that. We are pre-launch, moving fast,
                and building the team that will take us live.
              </p>
            </div>
            <div className="careers-intro-grid">
              <div className="careers-intro-item reveal-careers">
                <div className="intro-icon">🎯</div>
                <div>
                  <h4>Small team. Real ownership.</h4>
                  <p>
                    The team is intentionally small. What you build here ships
                    to real users in a city of 20 million people.
                  </p>
                </div>
              </div>
              <div className="careers-intro-item reveal-careers">
                <div className="intro-icon">🚀</div>
                <div>
                  <h4>Launching soon.</h4>
                  <p>
                    This is not a long pre-product phase. We are close to
                    launch. The work you do goes live on Lagos roads.
                  </p>
                </div>
              </div>
              <div className="careers-intro-item reveal-careers">
                <div className="intro-icon">📍</div>
                <div>
                  <h4>Built specifically for Lagos.</h4>
                  <p>
                    Pair is designed around how Lagos actually works — genuinely
                    hard and genuinely interesting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="careers-roles" id="roles" ref={rolesRef}>
          <div className="reveal-careers">
            <div className="section-tag">Open positions</div>
            <h2 className="section-title">
              Three roles.
              <br />
              <em>One launch.</em>
            </h2>
          </div>

          <div className="roles-grid">
            {roles.map((role, idx) => (
              <div key={role.title} className={`role-card reveal-careers`}>
                <div className="role-card-inner">
                  <div className={`role-dept ${role.deptClass}`}>
                    {role.dept}
                  </div>
                  <h3>{role.title}</h3>
                  <p className="role-desc">{role.desc}</p>
                  <div className="role-divider"></div>
                  <div className="role-what-title">You are someone who</div>
                  <ul className="role-list">
                    {role.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                  <button
                    className="role-apply"
                    onClick={() => openModal(role.title)}
                  >
                    <span>Apply for this role</span>
                    <span className="apply-arrow">↗</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="careers-process">
          <div className="reveal-careers">
            <div className="section-tag">How it works</div>
            <h2 className="section-title">The process.</h2>
          </div>
          <div className="process-steps">
            {[
              {
                num: "01",
                title: "Apply",
                desc: "Send your application with a short note on why this role and a link to relevant work.",
              },
              {
                num: "02",
                title: "Initial call",
                desc: "A direct conversation about the role, the work, and whether we are a fit.",
              },
              {
                num: "03",
                title: "Short task",
                desc: "A focused, paid task relevant to the role. Respectful of your time.",
              },
              {
                num: "04",
                title: "Offer",
                desc: "Clear offer, clear start date, clear scope. We move quickly for the right person.",
              },
            ].map((step, idx) => (
              <div key={idx} className="process-step reveal-careers">
                <div className="step-number">{step.num}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="footer-logo">
            Pair<span>.</span>
          </div>
          <div className="footer-links">
            <a href="mailto:careers@pairmobility.com" className="footer-email">
              careers@pairmobility.com
            </a>
          </div>
          <p>Lagos, Nigeria · © 2026 Pair Mobility</p>
        </footer>

        {/* Application Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) closeModal();
              }}
            >
              <motion.div
                className="modal"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <button className="modal-close" onClick={closeModal}>
                  ×
                </button>
                <div className="modal-for">Applying for</div>
                <h3 className="modal-title">{selectedRole}</h3>
                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+234 801 000 0000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Link to your work</label>
                    <input
                      type="url"
                      name="work_link"
                      placeholder="Portfolio, LinkedIn, GitHub, or Behance"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Why this role, and why Pair?</label>
                    <textarea
                      name="reason"
                      placeholder="Be direct. Two or three sentences is fine."
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {submitText}
                  </button>
                  <p className="form-note">
                    We review every application personally and respond within 5
                    working days.
                  </p>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {successModalOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessModalOpen(false)}
            >
              <motion.div
                className="modal success-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="success-icon">✓</div>
                <h3>Application Received!</h3>
                <p>
                  Thanks <strong>{submittedName}</strong>! We've received your
                  application for <strong>{selectedRole}</strong>.
                </p>
                <div className="success-details">
                  <p>
                    Our team will review your application and get back to you
                    within 5 working days.
                  </p>
                  <p className="success-email">📧 careers@pairmobility.com</p>
                </div>
                <button
                  onClick={() => setSuccessModalOpen(false)}
                  className="close-success"
                >
                  Got it, thanks →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
