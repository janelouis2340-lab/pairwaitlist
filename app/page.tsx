
// app/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
// Countdown timer for launch date
useEffect(() => {
  // Set your launch date here (example: April 15, 2026)
  const launchDate = new Date('April 15, 2026 00:00:00').getTime();
  
  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = launchDate - now;
    
    if (distance < 0) {
      // Launch has passed
      const daysElem = document.getElementById('cd-days');
      const hoursElem = document.getElementById('cd-hours');
      const minsElem = document.getElementById('cd-mins');
      const secsElem = document.getElementById('cd-secs');
      
      if (daysElem) daysElem.innerText = '00';
      if (hoursElem) hoursElem.innerText = '00';
      if (minsElem) minsElem.innerText = '00';
      if (secsElem) secsElem.innerText = '00';
      
      // Optionally change the label
      const labelElem = document.querySelector('.countdown-label');
      if (labelElem) labelElem.innerHTML = '🎉 Now Live! 🎉';
      return;
    }
    
    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Update DOM elements
    const daysElem = document.getElementById('cd-days');
    const hoursElem = document.getElementById('cd-hours');
    const minsElem = document.getElementById('cd-mins');
    const secsElem = document.getElementById('cd-secs');
    
    if (daysElem) daysElem.innerText = days.toString().padStart(2, '0');
    if (hoursElem) hoursElem.innerText = hours.toString().padStart(2, '0');
    if (minsElem) minsElem.innerText = minutes.toString().padStart(2, '0');
    if (secsElem) secsElem.innerText = seconds.toString().padStart(2, '0');
  };
  
  // Update immediately
  updateCountdown();
  
  // Update every second
  const interval = setInterval(updateCountdown, 1000);
  
  // Cleanup interval on component unmount
  return () => clearInterval(interval);
}, []);


// Add this test to your app/page.tsx temporarily
useEffect(() => {
  async function testSupabase() {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    
    try {
      const { data, error, count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Detailed error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('✅ Supabase connected! Count:', count);
      }
    } catch (err) {
      console.error('Exception caught:', err);
    }
  }
  
  testSupabase();
}, []);
  const [waitlistCount, setWaitlistCount] = useState(1247);
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    route: '',
    email: '',
    phone: '',
  });
  const [finalEmail, setFinalEmail] = useState('');

  // Refs for smooth scrolling
 
const howRef = useRef<HTMLElement | null>(null);
const faqRef = useRef<HTMLElement | null>(null);
const signupRef = useRef<HTMLElement | null>(null);

  // Fetch real waitlist count from Supabase
  const fetchWaitlistCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count) {
        setWaitlistCount(count);
      }
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchWaitlistCount();
    
    // Subscribe to new entries
    const channel = supabase
      .channel('waitlist_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'waitlist' },
        () => {
          fetchWaitlistCount(); // Refresh count when new user joins
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWaitlistCount]);


const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
  ref.current?.scrollIntoView({ behavior: 'smooth' });
};

const handleNavClick = (section: string, closeMobileMenu = false) => {
  if (section === 'how') scrollToSection(howRef);
  else if (section === 'faq') scrollToSection(faqRef);
  else if (section === 'signup') scrollToSection(signupRef);
  
  if (closeMobileMenu) {
    setMobileMenuOpen(false);
  }
};
  const highlightInput = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.borderColor = '#ff4444';
      setTimeout(() => {
        if (el) el.style.borderColor = 'rgba(255,255,255,0.12)';
      }, 2000);
    }
  };

const handleSignup = async () => {
  const { firstName, lastName, route, email, phone } = signupForm;
  
  // Validation
  if (!firstName) { highlightInput('firstName'); return; }
  if (!lastName) { highlightInput('lastName'); return; }
  if (!route) { highlightInput('routeSelect'); return; }
  if (!email || !email.includes('@')) { highlightInput('emailInput'); return; }
  
  setIsSubmitting(true);
  setSubmitError(null);
  
  try {
    console.log('Attempting to insert:', { firstName, lastName, email, route });
    
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        { 
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          route: route,
        }
      ])
      .select();
    
    if (error) {
      // Handle duplicate email error (code 23505)
      if (error.code === '23505') {
        setSubmitError('This email is already on our waitlist! 🎉');
        // Optionally highlight the email field
        highlightInput('emailInput');
        return;
      }
      
      // Handle other errors
      console.error('Supabase error:', error);
      setSubmitError('Something went wrong. Please try again.');
      return;
    }
    
    console.log('Insert successful:', data);
    showSuccess();
    
    // Reset form on success
    setSignupForm({
      firstName: '',
      lastName: '',
      route: '',
      email: '',
      phone: '',
    });
    
  } catch (err) {
    console.error('Exception caught:', err);
    setSubmitError('Network error. Please check your connection.');
  } finally {
    setIsSubmitting(false);
  }
};


const handleFinalSignup = async () => {
  if (!finalEmail || !finalEmail.includes('@')) {
    const el = document.getElementById('finalEmail');
    if (el) el.style.borderColor = 'rgba(255,255,255,0.5)';
    return;
  }
  
  setIsSubmitting(true);
  setSubmitError(null);
  
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        { 
          email: finalEmail.toLowerCase().trim(),
          first_name: 'Pending',
          last_name: 'Pending',
          route: 'pending'
        }
      ]);
    
    if (error) {
      if (error.code === '23505') {
        setSubmitError('This email is already on our waitlist! 🎉');
        const el = document.getElementById('finalEmail');
        if (el) el.style.borderColor = '#ff4444';
        return;
      }
      throw error;
    }
    
    showSuccess();
    setFinalEmail('');
    
  } catch (error) {
    console.error('Error:', error);
    setSubmitError('Failed to join waitlist. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  const showSuccess = (userData?: any) => {
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const shareWhatsApp = () => {
    const text = encodeURIComponent("I just joined the Pair waitlist — comfortable shared rides across Lagos. Get 25% off your first 3 trips: pairmobility.com");
    window.open('https://wa.me/?text=' + text, '_blank');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>Pair — Commute Differently</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
      </Head>

      <div className="app-container">
     {/* ANNOUNCEMENT BANNER */}
<div className="banner">
  🚀 Pair launches <strong>1st July 2025</strong> · Join the waitlist and get <strong>25% off your first 3 trips</strong>
</div>
        

        {/* NAV */}
        <nav className={`navbar ${mobileMenuOpen ? 'menu-open' : ''}`}>
          <div className="logo">pair<span>.</span></div>
          <div className="nav-links">
            <button onClick={() => handleNavClick('how')} className="nav-link">How it works</button>
            <button onClick={() => handleNavClick('faq')} className="nav-link">FAQ</button>
            <button onClick={() => handleNavClick('signup')} className="nav-link">Routes</button>
          </div>
          <button onClick={() => handleNavClick('signup')} className="nav-cta desktop-only">Join waitlist</button>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-container">
            <div className="mobile-menu-header">
              <div className="logo">pair<span>.</span></div>
              <button 
                className="mobile-menu-close" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
       <div className="mobile-menu-links">
  <button 
    onClick={() => {
      handleNavClick('how');
      setMobileMenuOpen(false); // Close menu
    }} 
    className="mobile-nav-link"
  >
    <span>01</span> How it works
  </button>
  <button 
    onClick={() => {
      handleNavClick('faq');
      setMobileMenuOpen(false); // Close menu
    }} 
    className="mobile-nav-link"
  >
    <span>02</span> FAQ
  </button>
  <button 
    onClick={() => {
      handleNavClick('signup');
      setMobileMenuOpen(false); // Close menu
    }} 
    className="mobile-nav-link"
  >
    <span>03</span> Routes
  </button>
  <button 
    onClick={() => {
      handleNavClick('signup');
      setMobileMenuOpen(false); // Close menu
    }} 
    className="mobile-nav-cta"
  >
    Join waitlist →
  </button>
</div>
            <div className="mobile-menu-footer">
              <p>Lagos, Nigeria</p>
              <div className="mobile-social">
                <span>Instagram</span>
                <span>Twitter</span>
                <span>LinkedIn</span>
              </div>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className="hero" ref={signupRef}>
          <div className="hero-left">
            <div className="hero-tag">Now accepting early access</div>
            <h1>Commute across Lagos <em>without</em> the chaos.</h1>
            <p className="hero-sub">Why pay half your monthly salary for a one-way taxi ride? Pair gets you there comfortably — shared, safe, and predictable — at a fraction of the cost.</p>
            <p className="hero-sub" style={{ marginTop: '-20px', fontSize: '15px' }}>No danfo scramble. No surge pricing. No roadside waiting. Join your ride from a restaurant, café, or mall near you — not a bus stop — track your driver in real time, and arrive without the stress.</p>

            <div className="incentive-badge">
              <div className="incentive-icon">🎁</div>
              <div className="incentive-text">
                <span className="incentive-headline">25% off your first 3 trips</span>
                <span className="incentive-sub">For waitlist members only · Limited time offer</span>
              </div>
            </div>

{/* COUNTDOWN TIMER - Modern Design */}
<div className="countdown-strip">
  <div className="countdown-label">🚀 Launching in</div>
  <div className="countdown-wrapper">
    <div className="countdown-item">
      <div className="countdown-number" id="cd-days">00</div>
      <div className="countdown-unit">DAYS</div>
    </div>
    <div className="countdown-item">
      <div className="countdown-number" id="cd-hours">00</div>
      <div className="countdown-unit">HRS</div>
    </div>
    <div className="countdown-item">
      <div className="countdown-number" id="cd-mins">00</div>
      <div className="countdown-unit">MINS</div>
    </div>
    <div className="countdown-item">
      <div className="countdown-number" id="cd-secs">00</div>
      <div className="countdown-unit">SECS</div>
    </div>
  </div>
</div>
            <div className="signup-box">
              <span className="signup-label">Join the waitlist — claim your 25% early access discount</span>

                {/* Error message display */}
              {submitError && (
                <div className="error-message" style={{ color:'red'}}>
                  ⚠️ {submitError}
                </div>
              )}

              <div className="name-row">
                <input
                  id="firstName"
                  className="text-input"
                  type="text"
                  placeholder="First name"
                  value={signupForm.firstName}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={isSubmitting}
                />
                <input
                  id="lastName"
                  className="text-input"
                  type="text"
                  placeholder="Last name"
                  value={signupForm.lastName}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>

              <select
                id="routeSelect"
                className="select-input"
                value={signupForm.route}
                onChange={(e) => setSignupForm(prev => ({ ...prev, route: e.target.value }))}
                disabled={isSubmitting}
              >
                <option value="" disabled>Select your route</option>
                <option value="ikeja-vi">Ikeja → Victoria Island</option>
                <option value="ajah-vi">Ajah → Victoria Island</option>
                <option value="ikeja-cms">Ikeja → CMS / Marina</option>
              </select>

              <input
                id="emailInput"
                className="text-input"
                type="email"
                placeholder="Email address"
                style={{ marginBottom: '12px', width: '100%' }}
                value={signupForm.email}
                onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={isSubmitting}
              />

              <div className="phone-input-wrap">
                <input className="country-code" value="+234" readOnly />
                <input
                  id="phoneInput"
                  className="phone-input"
                  type="tel"
                  placeholder="080X XXX XXXX (optional)"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="perks-row">
                <span className="perk-chip">✦ 25% off first 3 trips</span>
                <span className="perk-chip">✦ Priority boarding</span>
                <span className="perk-chip">✦ Early access</span>
              </div>

         <button className="submit-btn" onClick={handleSignup} disabled={isSubmitting}>
                {isSubmitting ? 'Joining...' : 'Reserve my spot →'}
              </button>
              <p className="signup-note">A confirmation will be sent to your email. Your phone number helps us notify you on WhatsApp at launch. No spam, ever.</p>
            </div>

            <div className="counter-strip">
              <div className="counter-left">
                <div className="avatars">
                  <div className="avatar">A</div>
                  <div className="avatar">K</div>
                  <div className="avatar">T</div>
                </div>
                <span className="counter-text"><strong>Lagosians</strong> already on the waitlist</span>
              </div>
              <div className="counter-right">{waitlistCount.toLocaleString()}</div>
            </div>
          </div>

          <div className="hero-right">
            <div className="route-card">
              <div className="live-badge"><div className="live-dot"></div> Pilot routes</div>
              <div className="card-label">Available corridors</div>
              <div className="routes-list">
                <div className="route-item">
                  <div className="route-dot"></div>
                  <div className="route-info">
                    <div className="route-name">Ikeja → Victoria Island</div>
                    <div className="route-meta">~30 km · Departures every 45 mins</div>
                  </div>
                  <div className="route-price-wrap">
                    <span className="route-price">₦4,050</span>
                    <span className="route-price-discount">₦5,400</span>
                  </div>
                </div>
                <div className="route-item">
                  <div className="route-dot"></div>
                  <div className="route-info">
                    <div className="route-name">Ajah → Victoria Island</div>
                    <div className="route-meta">~28 km · Departures every 45 mins</div>
                  </div>
                  <div className="route-price-wrap">
                    <span className="route-price">₦3,750</span>
                    <span className="route-price-discount">₦5,000</span>
                  </div>
                </div>
                <div className="route-item">
                  <div className="route-dot"></div>
                  <div className="route-info">
                    <div className="route-name">Ikeja → CMS / Marina</div>
                    <div className="route-meta">~25 km · Departures every 45 mins</div>
                  </div>
                  <div className="route-price-wrap">
                    <span className="route-price">₦3,375</span>
                    <span className="route-price-discount">₦4,500</span>
                  </div>
                </div>
              </div>
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-num">6</div>
                  <div className="stat-label">Seats per ride</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">AC</div>
                  <div className="stat-label">Every vehicle</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">0</div>
                  <div className="stat-label">Surge pricing</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section" ref={howRef}>
          <div className="section-tag">How it works</div>
          <h2 className="section-title">Four steps to a better commute.</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-icon">📱</div>
              <h3>Book on the app</h3>
              <p>Choose your route, pick a departure time, and get assigned a specific seat number. No scrambling, no uncertainty.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-icon">☕</div>
              <h3>Wait at a designated pickup point</h3>
              <p>Your pickup point is a restaurant, café, or mall close to your usual bus stop — just a lot safer. Sit down, track your vehicle arriving in real time.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-icon">🚐</div>
              <h3>Ride in comfort</h3>
              <p>Air-conditioned, verified passengers, real-time tracking, and a charging port at your seat. Every single trip.</p>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <div className="step-icon">📍</div>
              <h3>Arrive on schedule</h3>
              <p>Fixed routes, scheduled departures. Miss your ride? You're automatically placed on the next available departure.</p>
            </div>
          </div>
        </section>

        {/* CLARITY STATEMENT */}
        <section className="clarity-section">
          <div className="clarity-inner">
            <p className="clarity-text">Pair is not a danfo. Not a taxi.<br /><span>It's a clean, air-conditioned minivan — six verified passengers, one smooth ride.</span></p>
          </div>
        </section>

        {/* PICKUP EXPERIENCE */}
        <section className="pickup-section">
          <div className="pickup-inner">
            <div className="pickup-visual">
              <div className="vs-row">
                <div className="vs-box bad">
                  <div className="vs-label">Before Pair</div>
                  <div className="vs-desc">Standing roadside in Lagos heat, fighting for space on a danfo</div>
                </div>
                <div className="vs-divider">→</div>
                <div className="vs-box good">
                  <div className="vs-label">With Pair</div>
                  <div className="vs-desc">Seated at a café, coffee in hand, tracking your vehicle in real time</div>
                </div>
              </div>
              <div className="cafe-card">
                <div className="cafe-tags">
                  <span className="cafe-tag">☕ Café pickup point</span>
                  <span className="cafe-tag">Air conditioned</span>
                  <span className="cafe-tag">Free WiFi</span>
                  <span className="cafe-tag">Covered parking</span>
                  <span className="cafe-tag">Safe & secure</span>
                </div>
              </div>
            </div>

            <div className="pickup-content">
              <div className="section-tag">The pickup experience</div>
              <h2 className="section-title">No more standing on the roadside.</h2>

              <div className="pickup-feature">
                <div className="pickup-feature-icon">🏪</div>
                <div>
                  <h4>Join your ride from a restaurant, café or mall</h4>
                  <p>Every Pair pickup point is close to your usual bus stop — just a lot safer. Wait comfortably inside while you track your vehicle arriving in real time.</p>
                </div>
              </div>

              <div className="pickup-feature">
                <div className="pickup-feature-icon">📲</div>
                <div>
                  <h4>Real-time vehicle tracking</h4>
                  <p>Watch your vehicle on the map. You know exactly when to step outside — no guessing, no standing in the sun waiting.</p>
                </div>
              </div>

              <div className="pickup-feature">
                <div className="pickup-feature-icon">🔄</div>
                <div>
                  <h4>Miss your ride? No problem.</h4>
                  <p>If you miss a departure, the app automatically routes you to the next available vehicle on your corridor. You're never stranded.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY PAIR */}
        <section className="why-section">
          <div className="why-inner">
            <div className="section-tag">Why Pair</div>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>Built for the Lagos commuter. Finally.</h2>
            <div className="pillars-grid">
              <div className="pillar">
                <div className="pillar-icon">🔒</div>
                <h3>Verified passengers only</h3>
                <p>Every rider completes facial recognition before boarding. No strangers. No one-chance risk. Just people who commute like you.</p>
                <span className="pillar-tag">Safety first</span>
              </div>
              <div className="pillar">
                <div className="pillar-icon">💺</div>
                <h3>Your seat is guaranteed</h3>
                <p>You get an assigned seat number at the point of booking. Not a hope that there's space — an actual guaranteed seat, every time.</p>
                <span className="pillar-tag">No overcrowding</span>
              </div>
              <div className="pillar">
                <div className="pillar-icon">💰</div>
                <h3>Fraction of ride-hailing cost</h3>
                <p>Uber and Bolt charge ₦11,000–₦15,000 for the same journey. Pair costs ₦4,500–₦5,400. Same comfort, dramatically less cost.</p>
                <span className="pillar-tag">60–80% cheaper</span>
              </div>
            </div>
          </div>
        </section>

        {/* DRIVER SECTION */}
        <section className="driver-section">
          <div className="driver-card">
            <div className="driver-rating">
              <div>
                <div className="stars">★★★★★</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                  <span className="driver-rating-num" style={{ color: 'white' }}>4.9</span>
                  <span className="driver-rating-label">driver satisfaction target</span>
                </div>
              </div>
            </div>
            <ul className="driver-standards">
              <li className="driver-standard"><span className="standard-check">✓</span> Full identity and background verification</li>
              <li className="driver-standard"><span className="standard-check">✓</span> Professional driving standards training</li>
              <li className="driver-standard"><span className="standard-check">✓</span> Mandatory courtesy and conduct standards</li>
              <li className="driver-standard"><span className="standard-check">✓</span> Regular vehicle safety inspections</li>
              <li className="driver-standard"><span className="standard-check">✓</span> Periodic mental health and wellness checks</li>
              <li className="driver-standard"><span className="standard-check">✓</span> Real-time trip monitoring by Pair operations</li>
            </ul>
          </div>

          <div>
            <div className="section-tag">Our drivers</div>
            <h2 className="section-title">Trained, verified, and held to a standard.</h2>
            <p style={{ color: 'var(--gray)', fontSize: '16px', lineHeight: '1.7', marginBottom: '24px' }}>
              Every Pair driver goes through a rigorous onboarding process before they ever carry a passenger. We don't just verify who they are — we train them on how to drive professionally, treat passengers with respect, and handle situations calmly.
            </p>
            <p style={{ color: 'var(--gray)', fontSize: '16px', lineHeight: '1.7' }}>
              No aggression over change. No reckless overtaking. No phone calls while driving. Just a calm, professional commute — the way it should be.
            </p>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="compare-section">
          <div className="compare-inner">
            <div className="section-tag">The honest comparison</div>
            <h2 className="section-title">How Pair stacks up.</h2>
            <div className="compare-table-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th className="pair-col">Pair ✦</th>
                    <th>Danfo / BRT</th>
                    <th>Taxi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="feature-cell">Guaranteed seat</td><td className="pair-col"><span className="check">✓</span></td><td><span className="cross">✗</span></td><td><span className="check">✓</span></td></tr>
                  <tr><td className="feature-cell">Fixed pricing (no surge)</td><td className="pair-col"><span className="check">✓</span></td><td><span className="check">✓</span></td><td><span className="cross">✗</span></td></tr>
                  <tr><td className="feature-cell">Passenger verification</td><td className="pair-col"><span className="check">✓</span></td><td><span className="cross">✗</span></td><td>Driver only</td></tr>
                  <tr><td className="feature-cell">Affordable for daily use</td><td className="pair-col"><span className="check">✓</span></td><td><span className="check">✓</span></td><td><span className="cross">✗</span></td></tr>
                  <tr><td className="feature-cell">Air conditioning</td><td className="pair-col"><span className="check">✓</span></td><td><span className="cross">✗</span></td><td><span className="check">✓</span></td></tr>
                  <tr><td className="feature-cell">Per-seat charging ports</td><td className="pair-col"><span className="check">✓</span></td><td><span className="cross">✗</span></td><td><span className="cross">✗</span></td></tr>
                  <tr><td className="feature-cell">Trained & verified drivers</td><td className="pair-col"><span className="check">✓</span></td><td><span className="cross">✗</span></td><td>Basic only</td></tr>
                  <tr><td className="feature-cell">Comfortable pickup experience</td><td className="pair-col">Café / mall</td><td>Roadside</td><td>Any location</td></tr>
                  <tr><td className="feature-cell">Typical fare (Ikeja → VI)</td><td className="pair-col" style={{ color: 'var(--green)', fontWeight: '700' }}>₦5,400</td><td>₦600 – ₦1,500</td><td>₦11,000 – ₦15,000</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section" ref={faqRef}>
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">Questions we know you're asking.</h2>

          {[
            { q: "Is Pair a bus?", a: "Pair is not a taxi, nor a bus. Pair is a minivan with six passengers — each with a guaranteed seat — making different stops along the same route. Think of it as a smarter, safer, more comfortable way to share a journey with people heading in the same direction as you." },
            { q: "With six passengers in a minivan, won't that slow down the trip?", a: "No. Our trips are carefully curated to ensure drivers do not make too many stops. Each passenger will spend less than 30 seconds alighting from the vehicle — keeping the journey smooth and predictable for everyone on board." },
            { q: "How do I get my 25% discount on the first 3 trips?", a: "Simply join the waitlist by verifying your WhatsApp number on this page. When Pair launches and you take your first trip, your discount is automatically applied — no code needed. The 25% reduction applies to your first three trips on any route." },
            { q: "What if I miss my scheduled departure?", a: "No stress. The Pair app automatically routes you to the next available departure on your corridor. You'll never be stranded — just board the next vehicle. Departures run throughout the day, not just at peak commute hours." },
            { q: "How do I pay for my ride?", a: "All payments are made in advance through the Pair app using card, bank transfer, or mobile wallets like OPay and PalmPay. There's no cash handling on board, which keeps transactions clean and transparent for everyone." },
            { q: "Is it safe? How do you prevent criminals from boarding?", a: "Every Pair passenger goes through facial recognition verification before they can book a ride. This creates a closed, verified community of co-passengers — dramatically reducing the risk that plagues danfo and unregulated transport. Every trip is tracked in real time and your emergency contact can monitor your journey live." },
            { q: "Which routes are available?", a: "Pair is launching with three pilot corridors: Ikeja to Victoria Island, Ajah to Victoria Island, and Ikeja to CMS/Marina. More routes will open based on demand — join the waitlist for a route and we'll notify you the moment it goes live." },
            { q: "What are the drivers like?", a: "Every Pair driver is fully vetted, trained, and held to a strict professional conduct standard. That means no aggression, no phone calls while driving, no reckless overtaking. Drivers also undergo periodic wellness checks. If a driver falls below our standards, they're off the platform — passenger experience is non-negotiable for us." },
            { q: "What happens if the vehicle breaks down mid-trip?", a: "Our vehicles are maintained to a strict schedule and inspected regularly to minimise breakdowns. In the unlikely event of a breakdown, Pair's operations team is notified immediately and a replacement vehicle is dispatched. Affected passengers receive a full credit for their trip." },
            { q: "When does Pair launch?", a: "We're preparing for our pilot launch in Lagos. Waitlist members will be the first to know the exact date and will get priority access before the general public — along with their 25% discount on the first three trips." }
          ].map((faq, idx) => (
            <div key={idx} className={`faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(idx)}>
                {faq.q}
                <span className="faq-icon">{openFaqIndex === idx ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <div className="final-offer">🎁 25% off your first 3 trips — waitlist only</div>
          <h2>Ready to commute differently?</h2>
          <p>Join Lagosians already on the waitlist. Claim your discount before launch.</p>
          <div className="final-form">
            <input
              id="finalEmail"
              className="final-input"
              type="email"
              placeholder="Your email address"
              value={finalEmail}
              onChange={(e) => setFinalEmail(e.target.value)}
            />
            <button className="final-btn" onClick={handleFinalSignup}>Claim discount</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">pair<span>.</span></div>
          <p>Lagos, Nigeria · © 2025 Pair Mobility</p>
        </footer>

        {/* SUCCESS MODAL */}
        <div className={`modal-overlay ${modalOpen ? 'active' : ''}`}>
          <div className="modal">
            <div className="modal-icon">🎉</div>
            <h3>You're on the list.</h3>
            <p>Check your inbox — a confirmation is on its way. Your 25% discount is locked in from today.</p>

            <div className="modal-offer">
              <div className="modal-offer-headline">25% off × 3 trips</div>
              <div className="modal-offer-sub">Applied automatically on your first three rides</div>
            </div>

            <div className="position-badge">
              <div className="position-label">Your waitlist position</div>
              <div>#{waitlistCount.toLocaleString()}</div>
            </div>

            <p className="share-nudge">Move up the list — share with friends who commute on your route:</p>

            <button className="share-btn" onClick={shareWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp & move up the list
            </button>
            <button className="close-modal" onClick={closeModal}>I'll stay at my position for now</button>
          </div>
        </div>

        <style jsx>{`
/* Countdown Timer - EXACT DESIGN WITH BACKGROUNDS */
:global(.countdown-strip) {
  background: transparent;
  padding: 20px 0;
  margin-top: 20px;
  text-align: center;
}

:global(.countdown-label) {
  font-size: 14px;
  font-weight: 400;
  color: var(--gray);
  margin-bottom: 16px;
  text-transform: none;
  letter-spacing: normal;
}

:global(.countdown-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

:global(.countdown-item) {
  text-align: center;
  background: var(--black);
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 90px;
}

:global(.countdown-number) {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 36px;
  color: var(--white);
  line-height: 1.2;
  margin-bottom: 8px;
}

:global(.countdown-unit) {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

/* Mobile responsive */
@media (max-width: 768px) {
  :global(.countdown-wrapper) {
    gap: 12px;
  }
  
  :global(.countdown-item) {
    padding: 12px 16px;
    min-width: 70px;
    border-radius: 14px;
  }
  
  :global(.countdown-number) {
    font-size: 28px;
    margin-bottom: 6px;
  }
  
  :global(.countdown-unit) {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  :global(.countdown-wrapper) {
    gap: 8px;
  }
  
  :global(.countdown-item) {
    padding: 10px 12px;
    min-width: 60px;
    border-radius: 12px;
  }
  
  :global(.countdown-number) {
    font-size: 22px;
    margin-bottom: 4px;
  }
  
  :global(.countdown-unit) {
    font-size: 8px;
  }
}
        
          :global(:root) {
            --black: #0a0a0a;
            --white: #f5f3ee;
            --cream: #ede9e0;
            --green: #1a5c3a;
            --green-light: #2d7a50;
            --green-pale: #e8f0eb;
            --accent: #e8b84b;
            --gray: #6b6b6b;
            --gray-light: #d4d0c8;
          }

          :global(*) {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :global(html) {
            scroll-behavior: smooth;
          }

          :global(body) {
            background: var(--white);
            color: var(--black);
            font-family: 'DM Sans', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            overflow-x: hidden;
          }

          .app-container {
            position: relative;
          }

          /* NAV */
          :global(.navbar) {
            position: fixed;
            top: 40px;
            left: 0;
            right: 0;
            z-index: 100;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(245, 243, 238, 0.92);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0,0,0,0.06);
          }

          :global(.logo) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 22px;
            letter-spacing: -0.5px;
            color: var(--green);
          }
          :global(.logo span) { color: var(--accent); }

          :global(.nav-links) {
            display: flex;
            gap: 32px;
            align-items: center;
          }

          :global(.desktop-only) {
            display: block;
          }

          /* Mobile Menu Button */
          :global(.mobile-menu-btn) {
            display: none;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            z-index: 200;
            position: relative;
          }
          :global(.mobile-menu-btn span) {
            width: 24px;
            height: 2px;
            background: var(--black);
            border-radius: 2px;
            transition: all 0.3s ease;
          }
          :global(.mobile-menu-btn.active span:nth-child(1)) {
            transform: rotate(45deg) translate(5px, 5px);
          }
          :global(.mobile-menu-btn.active span:nth-child(2)) {
            opacity: 0;
          }
          :global(.mobile-menu-btn.active span:nth-child(3)) {
            transform: rotate(-45deg) translate(5px, -5px);
          }

          /* Mobile Menu Overlay */
          :global(.mobile-menu-overlay) {
            position: fixed;
            top: 0;
            right: -100%;
            width: 100%;
            height: 100vh;
            background: var(--white);
            z-index: 150;
            transition: right 0.3s ease;
            overflow-y: auto;
          }
          :global(.mobile-menu-overlay.active) {
            right: 0;
          }

          :global(.mobile-menu-container) {
            padding: 100px 24px 40px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          :global(.mobile-menu-header) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 48px;
          }

          :global(.mobile-menu-close) {
            background: var(--green-pale);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            color: var(--green);
            transition: all 0.2s;
          }
          :global(.mobile-menu-close:hover) {
            background: var(--green);
            color: white;
          }

          :global(.mobile-menu-links) {
            display: flex;
            flex-direction: column;
            gap: 24px;
            flex: 1;
          }

          :global(.mobile-nav-link) {
            background: none;
            border: none;
            text-align: left;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 28px;
            color: var(--black);
            cursor: pointer;
            padding: 12px 0;
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 2px solid var(--cream);
            transition: color 0.2s;
          }
          :global(.mobile-nav-link span) {
            font-size: 16px;
            color: var(--accent);
            font-weight: 500;
          }
          :global(.mobile-nav-link:hover) {
            color: var(--green);
          }

          :global(.mobile-nav-cta) {
            background: var(--green);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 100px;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 18px;
            cursor: pointer;
            margin-top: 32px;
            transition: all 0.2s;
          }
          :global(.mobile-nav-cta:hover) {
            background: var(--green-light);
            transform: translateY(-2px);
          }

          :global(.mobile-menu-footer) {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid var(--cream);
          }
          :global(.mobile-menu-footer p) {
            color: var(--gray);
            font-size: 14px;
            margin-bottom: 16px;
          }
          :global(.mobile-social) {
            display: flex;
            gap: 24px;
          }
          :global(.mobile-social span) {
            color: var(--gray);
            font-size: 13px;
            cursor: pointer;
            transition: color 0.2s;
          }
          :global(.mobile-social span:hover) {
            color: var(--green);
          }

          :global(.nav-link) {
            font-size: 14px;
            color: var(--gray);
            text-decoration: none;
            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.2s;
            font-family: 'DM Sans', sans-serif;
          }
          :global(.nav-link:hover) { color: var(--black); }

          :global(.nav-cta) {
            background: var(--green);
            color: var(--white);
            border: none;
            padding: 10px 22px;
            border-radius: 100px;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
          }
          :global(.nav-cta:hover) { background: var(--green-light); transform: translateY(-1px); }

          /* ANNOUNCEMENT BANNER */
          :global(.banner) {
            background: var(--green);
            color: white;
            text-align: center;
            padding: 10px 20px;
            font-size: 14px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 101;
          }

          :global(.banner strong) { color: var(--accent); }

          :global(body) { padding-top: 40px; }

          /* HERO */
          :global(.hero) {
            min-height: 100vh;
            padding: 160px 40px 80px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
          }

          :global(.hero-tag) {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--green-pale);
            color: var(--green);
            padding: 6px 14px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 28px;
            animation: fadeUp 0.6s ease both;
          }

          :global(.hero-tag::before) {
            content: '';
            width: 6px;
            height: 6px;
            background: var(--green);
            border-radius: 50%;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
          }

          :global(h1) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: clamp(40px, 5vw, 64px);
            line-height: 1.05;
            letter-spacing: -2px;
            color: var(--black);
            margin-bottom: 24px;
            animation: fadeUp 0.6s ease 0.1s both;
          }

          :global(h1 em) {
            font-style: normal;
            color: var(--green);
            position: relative;
          }

          :global(h1 em::after) {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--accent);
            border-radius: 2px;
          }

          :global(.hero-sub) {
            font-size: 18px;
            color: var(--gray);
            font-weight: 300;
            max-width: 440px;
            margin-bottom: 40px;
            line-height: 1.7;
            animation: fadeUp 0.6s ease 0.2s both;
          }

          :global(.incentive-badge) {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #e8b84b15, #e8b84b25);
            border: 1.5px solid var(--accent);
            border-radius: 14px;
            padding: 12px 18px;
            margin-bottom: 28px;
            animation: fadeUp 0.6s ease 0.15s both;
          }

          :global(.incentive-icon) { font-size: 24px; }
          :global(.incentive-text) { display: flex; flex-direction: column; }
          :global(.incentive-headline) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 16px;
            color: var(--black);
            line-height: 1.2;
          }
          :global(.incentive-sub) { font-size: 12px; color: var(--gray); }

          :global(.signup-box) {
            background: var(--black);
            border-radius: 20px;
            padding: 28px;
            animation: fadeUp 0.6s ease 0.3s both;
          }

          :global(.name-row) {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
          }

          :global(.text-input) {
            flex: 1;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            color: var(--white);
            padding: 14px 18px;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            outline: none;
            transition: border-color 0.2s;
            width: 100%;
          }
          :global(.text-input::placeholder) { color: rgba(255,255,255,0.3); }
          :global(.text-input:focus) { border-color: var(--accent); }

          :global(.select-input) {
            width: 100%;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            color: var(--white);
            padding: 14px 18px;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            outline: none;
            margin-bottom: 12px;
            cursor: pointer;
            transition: border-color 0.2s;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 18px center;
          }
          :global(.select-input:focus) { border-color: var(--accent); }
          :global(.select-input option) {
            background: #1a1a1a;
            color: var(--white);
          }

          :global(.signup-label) {
            color: var(--gray-light);
            font-size: 13px;
            font-weight: 400;
            margin-bottom: 14px;
            display: block;
          }

          :global(.phone-input-wrap) {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
            flex-wrap: wrap;
          }

          :global(.country-code) {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            color: var(--white);
            padding: 14px 16px;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            width: 80px;
            text-align: center;
          }

          :global(.phone-input) {
            flex: 1;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            color: var(--white);
            padding: 14px 18px;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            outline: none;
            transition: border-color 0.2s;
            min-width: 0;
          }
          :global(.phone-input::placeholder) { color: rgba(255,255,255,0.3); }
          :global(.phone-input:focus) { border-color: var(--accent); }

          :global(.submit-btn) {
            width: 100%;
            background: var(--green);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 16px;
            font-family: 'Syne', sans-serif;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.2s;
            margin-bottom: 14px;
            letter-spacing: -0.3px;
          }
          :global(.submit-btn:hover) { background: var(--green-light); transform: translateY(-1px); }

          :global(.signup-note) {
            color: rgba(255,255,255,0.3);
            font-size: 12px;
            text-align: center;
          }

          :global(.perks-row) {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }

          :global(.perk-chip) {
            background: rgba(232,184,75,0.12);
            border: 1px solid rgba(232,184,75,0.25);
            color: var(--accent);
            font-size: 11px;
            padding: 5px 10px;
            border-radius: 100px;
            white-space: nowrap;
          }

          :global(.counter-strip) {
            background: var(--cream);
            border: 1px solid var(--gray-light);
            border-radius: 14px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 16px;
            animation: fadeUp 0.6s ease 0.4s both;
          }

          :global(.counter-left) { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
          :global(.avatars) { display: flex; }

          :global(.avatar) {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid var(--white);
            margin-left: -8px;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: white;
          }
          :global(.avatar:first-child) { margin-left: 0; background: #2d7a50; }
          :global(.avatar:nth-child(2)) { background: #e8b84b; color: var(--black); }
          :global(.avatar:nth-child(3)) { background: #1a5c3a; }

          :global(.counter-text) { font-size: 13px; color: var(--gray); }
          :global(.counter-text strong) { color: var(--black); }
          :global(.counter-right) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 22px;
            color: var(--green);
          }

          :global(.hero-right) { animation: fadeUp 0.8s ease 0.2s both; }

          /* ROUTE CARD */
          :global(.route-card) {
            background: var(--green);
            border-radius: 24px;
            padding: 32px;
            color: white;
            position: relative;
            overflow: hidden;
          }
          :global(.route-card::before) {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.04);
            border-radius: 50%;
          }

          :global(.card-label) {
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.5);
            margin-bottom: 20px;
          }

          :global(.live-badge) {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(232,184,75,0.15);
            border: 1px solid rgba(232,184,75,0.3);
            color: var(--accent);
            padding: 4px 10px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 500;
            margin-bottom: 24px;
          }

          :global(.live-dot) {
            width: 5px;
            height: 5px;
            background: var(--accent);
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          }

          :global(.routes-list) { position: relative; z-index: 1; }

          :global(.route-item) {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            transition: all 0.2s;
            flex-wrap: wrap;
          }
          :global(.route-item:last-child) { border-bottom: none; }
          :global(.route-item:hover) { transform: translateX(4px); }

          :global(.route-dot) {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent);
            flex-shrink: 0;
            box-shadow: 0 0 0 3px rgba(232,184,75,0.2);
          }

          :global(.route-info) { flex: 1; min-width: 140px; }
          :global(.route-name) {
            font-family: 'Syne', sans-serif;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 2px;
          }
          :global(.route-meta) { font-size: 12px; color: rgba(255,255,255,0.5); }
          :global(.route-price-wrap) { text-align: right; }
          :global(.route-price) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 15px;
            color: var(--accent);
            display: block;
          }
          :global(.route-price-discount) {
            font-size: 10px;
            color: rgba(255,255,255,0.4);
            text-decoration: line-through;
          }

          :global(.stats-row) {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 20px;
            position: relative;
            z-index: 1;
          }

          :global(.stat-box) {
            background: rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 14px;
            text-align: center;
          }

          :global(.stat-num) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 20px;
            margin-bottom: 2px;
          }

          :global(.stat-label) {
            font-size: 10px;
            color: rgba(255,255,255,0.4);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* SECTION */
          :global(.section) {
            max-width: 1200px;
            margin: 0 auto;
            padding: 100px 40px;
          }

          :global(.section-tag) {
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: var(--green);
            margin-bottom: 14px;
          }

          :global(.section-title) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: clamp(32px, 4vw, 48px);
            letter-spacing: -1.5px;
            line-height: 1.1;
            margin-bottom: 60px;
            max-width: 500px;
          }

          :global(.steps-grid) {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }

          :global(.step-num) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 48px;
            color: var(--cream);
            line-height: 1;
            margin-bottom: 16px;
          }

          :global(.step-icon) {
            width: 48px;
            height: 48px;
            background: var(--green-pale);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            font-size: 22px;
          }

          :global(.step h3) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 8px;
          }

          :global(.step p) { font-size: 14px; color: var(--gray); line-height: 1.6; }

          /* CLARITY */
          :global(.clarity-section) {
            background: var(--black);
            padding: 70px 40px;
            text-align: center;
          }

          :global(.clarity-inner) {
            max-width: 800px;
            margin: 0 auto;
          }

          :global(.clarity-text) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: clamp(22px, 3.5vw, 36px);
            color: rgba(255,255,255,0.4);
            line-height: 1.4;
            letter-spacing: -0.5px;
          }

          :global(.clarity-text span) { color: var(--white); }

          /* PICKUP */
          :global(.pickup-section) {
            background: var(--cream);
            padding: 100px 40px;
          }

          :global(.pickup-inner) {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
          }

          :global(.pickup-visual) {
            background: var(--white);
            border-radius: 24px;
            padding: 40px;
            position: relative;
          }

          :global(.cafe-card) {
            background: var(--green);
            border-radius: 16px;
            padding: 24px;
            color: white;
            margin-bottom: 16px;
          }

          :global(.cafe-name) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 4px;
          }

          :global(.cafe-meta) { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 16px; }

          :global(.cafe-tags) { display: flex; gap: 8px; flex-wrap: wrap; }

          :global(.cafe-tag) {
            background: rgba(255,255,255,0.1);
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 100px;
            color: rgba(255,255,255,0.8);
          }

          :global(.vs-row) {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }

          :global(.vs-box) {
            flex: 1;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }

          :global(.vs-box.bad) {
            background: #fff0f0;
            border: 1px solid #ffcccc;
          }

          :global(.vs-box.good) {
            background: var(--green-pale);
            border: 1px solid rgba(26,92,58,0.2);
          }

          :global(.vs-label) {
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }

          :global(.vs-box.bad .vs-label) { color: #cc3333; }
          :global(.vs-box.good .vs-label) { color: var(--green); }

          :global(.vs-desc) { font-size: 13px; color: var(--gray); }

          :global(.vs-divider) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 14px;
            color: var(--gray-light);
          }

          :global(.pickup-content .section-tag) { color: var(--green); }

          :global(.pickup-feature) {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }

          :global(.pickup-feature-icon) {
            width: 40px;
            height: 40px;
            background: var(--green-pale);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          :global(.pickup-feature h4) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 4px;
          }

          :global(.pickup-feature p) { font-size: 14px; color: var(--gray); }

          /* WHY */
          :global(.why-section) {
            background: var(--black);
            padding: 100px 40px;
          }

          :global(.why-inner) { max-width: 1200px; margin: 0 auto; }

          :global(.why-section .section-tag) { color: var(--accent); }
          :global(.why-section .section-title) { color: var(--white); }

          :global(.pillars-grid) {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2px;
            background: rgba(255,255,255,0.06);
            border-radius: 20px;
            overflow: hidden;
          }

          :global(.pillar) {
            background: var(--black);
            padding: 40px;
            transition: background 0.3s;
          }

          :global(.pillar:hover) { background: #111; }

          :global(.pillar-icon) { font-size: 32px; margin-bottom: 20px; }

          :global(.pillar h3) {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 20px;
            color: var(--white);
            margin-bottom: 10px;
          }

          :global(.pillar p) { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.7; }

          :global(.pillar-tag) {
            display: inline-block;
            background: rgba(232,184,75,0.1);
            color: var(--accent);
            font-size: 11px;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 100px;
            margin-top: 16px;
          }

          /* DRIVER */
          :global(.driver-section) {
            max-width: 1200px;
            margin: 0 auto;
            padding: 100px 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
          }

          :global(.driver-card) {
            background: var(--black);
            border-radius: 24px;
            padding: 40px;
            color: white;
            position: relative;
            overflow: hidden;
          }

          :global(.driver-card::before) {
            content: '★';
            position: absolute;
            font-size: 200px;
            color: rgba(255,255,255,0.02);
            bottom: -40px;
            right: -20px;
            font-family: 'Syne', sans-serif;
          }

          :global(.driver-rating) {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 24px;
          }

          :global(.stars) { color: var(--accent); font-size: 20px; letter-spacing: 2px; }

          :global(.driver-rating-num) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 28px;
          }

          :global(.driver-rating-label) { font-size: 13px; color: rgba(255,255,255,0.4); }

          :global(.driver-standards) { list-style: none; }

          :global(.driver-standard) {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 0;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            flex-wrap: wrap;
          }

          :global(.driver-standard:last-child) { border-bottom: none; }

          :global(.standard-check) {
            width: 24px;
            height: 24px;
            background: var(--green);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            flex-shrink: 0;
          }

          /* COMPARE */
          :global(.compare-section) {
            background: var(--cream);
            padding: 100px 40px;
          }

          :global(.compare-inner) { max-width: 1200px; margin: 0 auto; }
          :global(.compare-table-wrapper) { overflow-x: auto; }

          :global(.compare-table) {
            width: 100%;
            border-collapse: collapse;
            margin-top: 40px;
            min-width: 600px;
          }

          :global(.compare-table th) {
            padding: 16px 20px;
            text-align: left;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 14px;
            border-bottom: 2px solid var(--gray-light);
          }

          :global(.compare-table th.pair-col) {
            background: var(--green);
            color: white;
            border-radius: 12px 12px 0 0;
            text-align: center;
          }

          :global(.compare-table td) {
            padding: 16px 20px;
            font-size: 14px;
            border-bottom: 1px solid var(--gray-light);
            color: var(--gray);
            background: var(--white);
          }

          :global(.compare-table td:first-child) { background: transparent; color: var(--black); font-weight: 500; }

          :global(.compare-table td.pair-col) {
            background: var(--green-pale);
            text-align: center;
            font-weight: 500;
            color: var(--green);
          }

          :global(.check) { color: var(--green); font-size: 18px; }
          :global(.cross) { color: #ccc; font-size: 18px; }

          /* FAQ */
          :global(.faq-section) {
            max-width: 800px;
            margin: 0 auto;
            padding: 100px 40px;
          }

          :global(.faq-section .section-title) { max-width: 100%; margin-bottom: 40px; }

          :global(.faq-item) {
            border-bottom: 1px solid var(--cream);
          }

          :global(.faq-question) {
            width: 100%;
            background: none;
            border: none;
            padding: 22px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            text-align: left;
            font-family: 'Syne', sans-serif;
            font-weight: 600;
            font-size: 17px;
            color: var(--black);
            gap: 16px;
            transition: color 0.2s;
          }

          :global(.faq-question:hover) { color: var(--green); }

          :global(.faq-icon) {
            width: 28px;
            height: 28px;
            background: var(--green-pale);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
            color: var(--green);
            transition: all 0.3s;
            font-weight: 700;
          }

          :global(.faq-item.open .faq-icon) {
            background: var(--green);
            color: white;
            transform: rotate(45deg);
          }

          :global(.faq-answer) {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease, padding 0.3s ease;
          }

          :global(.faq-item.open .faq-answer) { max-height: 300px; }

          :global(.faq-answer p) {
            font-size: 15px;
            color: var(--gray);
            line-height: 1.7;
            padding-bottom: 22px;
          }

          /* FINAL CTA */
          :global(.final-cta) {
            background: var(--green);
            padding: 100px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          :global(.final-cta::before) {
            content: 'PAIR';
            position: absolute;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 300px;
            color: rgba(255,255,255,0.03);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            white-space: nowrap;
            pointer-events: none;
          }

          :global(.final-cta h2) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: clamp(36px, 5vw, 60px);
            letter-spacing: -2px;
            color: white;
            margin-bottom: 12px;
            position: relative;
          }

          :global(.final-offer) {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--accent);
            color: var(--black);
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 15px;
            padding: 8px 20px;
            border-radius: 100px;
            margin-bottom: 20px;
            position: relative;
          }

          :global(.final-cta p) {
            color: rgba(255,255,255,0.6);
            font-size: 17px;
            margin-bottom: 40px;
            position: relative;
          }

          :global(.final-form) {
            display: flex;
            gap: 12px;
            max-width: 460px;
            margin: 0 auto;
            position: relative;
          }

          :global(.final-input) {
            flex: 1;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            color: white;
            padding: 16px 20px;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            outline: none;
          }

          :global(.final-input::placeholder) { color: rgba(255,255,255,0.4); }

          :global(.final-btn) {
            background: var(--accent);
            color: var(--black);
            border: none;
            border-radius: 12px;
            padding: 16px 24px;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
          }

          :global(.final-btn:hover) { background: #f0c860; transform: translateY(-1px); }

          /* FOOTER */
          :global(footer) {
            background: var(--black);
            padding: 30px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          :global(.footer-logo) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 18px;
            color: var(--white);
          }

          :global(.footer-logo span) { color: var(--accent); }
          :global(footer p) { font-size: 12px; color: rgba(255,255,255,0.3); }

          /* MODAL */
          :global(.modal-overlay) {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
          }

          :global(.modal-overlay.active) { display: flex; }

          :global(.modal) {
            background: var(--white);
            border-radius: 24px;
            padding: 40px;
            max-width: 420px;
            width: 90%;
            text-align: center;
            animation: modalIn 0.3s ease;
          }

          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          :global(.modal-icon) { font-size: 48px; margin-bottom: 16px; }

          :global(.modal h3) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 24px;
            margin-bottom: 8px;
          }

          :global(.modal p) { color: var(--gray); font-size: 15px; margin-bottom: 20px; }

          :global(.modal-offer) {
            background: linear-gradient(135deg, #e8b84b20, #e8b84b35);
            border: 1.5px solid var(--accent);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 20px;
          }

          :global(.modal-offer-headline) {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 22px;
            color: var(--black);
            margin-bottom: 4px;
          }

          :global(.modal-offer-sub) { font-size: 13px; color: var(--gray); }

          :global(.position-badge) {
            background: var(--green);
            color: white;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 32px;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 20px;
          }

          :global(.position-label) { font-size: 12px; color: rgba(255,255,255,0.6); font-family: 'DM Sans', sans-serif; font-weight: 400; margin-bottom: 4px; }

          :global(.share-btn) {
            width: 100%;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 12px;
            padding: 14px;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 10px;
            transition: all 0.2s;
          }

          :global(.share-btn:hover) { background: #20bc59; }

          :global(.share-nudge) {
            font-size: 12px;
            color: var(--gray);
            margin-bottom: 12px;
          }

          :global(.close-modal) {
            background: none;
            border: none;
            color: var(--gray);
            font-size: 14px;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* ============================================ */
          /* ENHANCED MOBILE RESPONSIVE BREAKPOINTS */
          /* ============================================ */
          
          @media (max-width: 900px) {
            :global(.pillars-grid) { grid-template-columns: 1fr; }
          }

          @media (max-width: 768px) {
            :global(.banner) { font-size: 12px; padding: 8px 16px; }
            :global(.navbar) { padding: 16px 20px; top: 36px; }
            :global(.nav-links) { display: none; }
            :global(.desktop-only) { display: none; }
            :global(.mobile-menu-btn) { display: flex; }
            
            /* Hero becomes column layout */
            :global(.hero) { 
              grid-template-columns: 1fr; 
              padding: 130px 20px 60px; 
              gap: 40px; 
            }
            :global(.hero-right) { order: -1; }
            
            /* Steps grid - 2 columns on tablet, 1 on mobile */
            :global(.steps-grid) { grid-template-columns: repeat(2, 1fr); }
            
            :global(.section) { padding: 60px 20px; }
            :global(.pickup-section) { padding: 60px 20px; }
            :global(.pickup-inner) { grid-template-columns: 1fr; gap: 40px; }
            :global(.why-section) { padding: 60px 20px; }
            :global(.driver-section) { grid-template-columns: 1fr; padding: 60px 20px; gap: 40px; }
            :global(.compare-section) { padding: 60px 20px; overflow-x: auto; }
            :global(.faq-section) { padding: 60px 20px; }
            :global(.final-cta) { padding: 80px 20px; }
            :global(.final-form) { flex-direction: column; }
            :global(footer) { flex-direction: column; gap: 10px; text-align: center; }
            :global(.counter-strip) { flex-direction: column; gap: 10px; text-align: center; }
            
            /* Route items - full width layout on mobile */
            :global(.route-item) { 
              flex-direction: column; 
              align-items: flex-start;
              gap: 12px;
            }
            :global(.route-price-wrap) { 
              text-align: left; 
              width: 100%;
              display: flex;
              gap: 8px;
              align-items: center;
            }
            :global(.route-dot) { display: none; }
            :global(.route-info) { width: 100%; }
            
            /* Stats row - stack on mobile */
            :global(.stats-row) { 
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
            }
            :global(.stat-box) { padding: 10px; }
            :global(.stat-num) { font-size: 18px; }
            
            /* Form adjustments */
            :global(.name-row) { flex-direction: column; gap: 10px; }
            :global(.phone-input-wrap) { flex-direction: column; }
            :global(.country-code) { width: 100%; }
            
            /* Perks chips wrap */
            :global(.perks-row) { 
              justify-content: center;
            }
            :global(.perk-chip) { white-space: normal; text-align: center; }
            
            /* Incentive badge on mobile */
            :global(.incentive-badge) { 
              width: 100%;
              justify-content: center;
            }
            
            /* VS row on mobile */
            :global(.vs-row) { 
              flex-direction: column;
              gap: 12px;
            }
            :global(.vs-divider) { transform: rotate(90deg); }
            
            /* FAQ question font */
            :global(.faq-question) { font-size: 15px; padding: 18px 0; }
          }
          
          /* Extra small devices (phones under 480px) */
          @media (max-width: 480px) {
            :global(.steps-grid) { grid-template-columns: 1fr; }
            :global(.route-card) { padding: 24px; }
            :global(.signup-box) { padding: 20px; }
            :global(.text-input) { padding: 12px 16px; font-size: 14px; }
            :global(.select-input) { padding: 12px 16px; font-size: 14px; }
            :global(.submit-btn) { padding: 14px; font-size: 15px; }
            :global(.hero) { padding: 120px 16px 40px; }
            :global(h1) { font-size: clamp(34px, 8vw, 40px); letter-spacing: -1px; }
            :global(.hero-sub) { font-size: 16px; margin-bottom: 24px; }
            :global(.section-title) { font-size: clamp(28px, 6vw, 36px); margin-bottom: 32px; }
            :global(.counter-right) { font-size: 20px; }
            :global(.modal) { padding: 28px 20px; }
            :global(.modal h3) { font-size: 20px; }
            :global(.position-badge) { font-size: 24px; padding: 12px; }
            :global(.pillar) { padding: 28px; }
            :global(.driver-card) { padding: 28px; }
            :global(.pickup-visual) { padding: 24px; }
            
            /* Mobile menu adjustments */
            :global(.mobile-nav-link) { font-size: 24px; }
          }
          
          /* Landscape orientation fix */
          @media (max-width: 900px) and (orientation: landscape) {
            :global(.hero) { padding: 140px 20px 40px; }
            :global(.steps-grid) { grid-template-columns: repeat(2, 1fr); }
          }
        `}</style>
      </div>
    </>
  );
}