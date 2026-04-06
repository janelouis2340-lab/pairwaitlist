
// app/page.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
// Countdown timer for launch date
useEffect(() => {
  // Set your launch date here (example: April 15, 2026)
  const launchDate = new Date('July 1, 2026 00:00:00').getTime();
  
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


  // ADD THIS LINE HERE - Right after your other state declarations
  const [submittedUser, setSubmittedUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: 0
  });


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
  if (!phone) { highlightInput('phoneInput'); return; }
  
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
        // Fetch existing user's name and position from database
        const { data: existingUser } = await supabase
          .from('waitlist')
          .select('first_name, last_name, waitlist_position')
          .eq('email', email.toLowerCase().trim())
          .single();
        
        if (existingUser) {
          setSubmittedUser({
            firstName: existingUser.first_name,
            lastName: existingUser.last_name,
            email: email,
            position: existingUser.waitlist_position
          });
        }
        
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
    
    // Save the submitted user data for the modal
    setSubmittedUser({
      firstName: firstName,
      lastName: lastName,
      email: email,
      position: data?.[0]?.waitlist_position || waitlistCount + 1
    });
    
    // Show success modal
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
  🚀 Pair launches <strong>1st July 2025</strong> · Join the waitlist and get <strong>25% off your first 6 trips</strong>
</div>
        

        {/* NAV */}
        <nav className={`navbar ${mobileMenuOpen ? 'menu-open' : ''}`}>
          <div className="logo">Pair<span>.</span></div>
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
{/* HERO */}
<section className="hero" ref={signupRef}>
  
  {/* Hero Left Content - Visible on both desktop and mobile */}
  <div className="hero-left">
    <div className="hero-tag">Now accepting early access</div>
    <h1>Commute across Lagos <em>without</em> the chaos.</h1>
    <p className="hero-sub">Why pay half your monthly salary for a one-way taxi ride? Pair gets you there comfortably . In an air-conditioned Minivan with six passengers. Pair is safe and predictable , at a fraction of the cost.</p>
    <p className="hero-sub" style={{ marginTop: '-20px', fontSize: '15px' }}>No need scrambling for danfo . No surge pricing. No roadside waiting. Join your ride from a restaurant, café, or mall near you not a bus stop. Track your driver in real time, and arrive without the stress.</p>

    <div className="incentive-badge">
      <div className="incentive-icon">🎁</div>
      <div className="incentive-text">
        <span className="incentive-headline">25% off your first 6 trips</span>
        <span className="incentive-sub">For waitlist members only · Limited time offer</span>
      </div>
    </div>
  </div>

  {/* Hero Right - Route Cards (will appear second on mobile) */}
  <div className="hero-right">
    <div className="route-card">
      <div className="live-badge">
        <div className="live-dot"></div> Pilot routes
      </div>
      <div className="card-label">Available corridors · Waitlist price shown</div>
      <div className="routes-list">
        <div className="route-item">
          <div className="route-dot"></div>
          <div className="route-info">
            <div className="route-name">Ikeja → Victoria Island</div>
            <div className="taxi-compare">Taxis charge est. ₦13,000–₦15,000 on this route. They don't guarantee A/C. Pair does.</div>
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
            <div className="taxi-compare">Taxis charge est. ₦13,000–₦15,000 on this route. They don't guarantee A/C. Pair does.</div>
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
            <div className="taxi-compare">Taxis charge est. ₦11,000–₦13,000 on this route. They don't guarantee A/C. Pair does.</div>
          </div>
          <div className="route-price-wrap">
            <span className="route-price">₦3,375</span>
            <span className="route-price-discount">₦4,500</span>
          </div>
        </div>

        <div className="route-item">
          <div className="route-dot"></div>
          <div className="route-info">
            <div className="route-name">Yaba → Lekki Phase 1</div>
            <div className="taxi-compare">Taxis charge est. ₦10,000 on this route. They don't guarantee A/C. Pair does.</div>
          </div>
          <div className="route-price-wrap">
            <span className="route-price">₦2,500</span>
            <span className="route-price-discount">₦3,000</span>
          </div>
        </div>

        <div className="route-item">
          <div className="route-dot"></div>
          <div className="route-info">
            <div className="route-name">Surulere → Lekki Phase 1</div>
            <div className="taxi-compare">Taxis charge est. ₦10,500 on this route. They don't guarantee A/C. Pair does.</div>
          </div>
          <div className="route-price-wrap">
            <span className="route-price">₦2,800</span>
            <span className="route-price-discount">₦3,500</span>
          </div>
        </div>
      </div>
      <div className="taxi-note">Waitlist price shown · Standard fare applies after first 6 trips · Taxi estimates based on typical peak-hour fares</div>
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

  {/* Countdown and Signup Form (will appear third on mobile) */}
  <div className="hero-form-section">
    {/* COUNTDOWN TIMER */}
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
        <option value="yaba-lekki">Yaba → Lekki Phase 1</option>
        <option value="surulere-lekki">Surulere → Lekki Phase 1</option>
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
 
        <input
          id="phoneInput"
          className="phone-input"
          type="tel"
          placeholder="Enter Your Whatsapp Number"
          value={signupForm.phone}
          onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="perks-row">
        <span className="perk-chip">✦ 25% off first 6 trips</span>
        <span className="perk-chip">✦ Priority boarding</span>
        <span className="perk-chip">✦ Early access</span>
      </div>

      <button className="submit-btn" onClick={handleSignup} disabled={isSubmitting}>
        {isSubmitting ? 'Joining...' : 'Reserve my spot →'}
      </button>
      <p className="signup-note">A confirmation will be sent to you on WhatsApp at launch with your promo code. No spam, ever.</p>
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
      <div className="counter-right">49{waitlistCount.toLocaleString()}</div>
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
            { q: "How do I get my 25% discount on the first 6 trips?", a: "Simply join the waitlist by verifying your WhatsApp number on this page. When Pair launches and you take your first trip, your discount is automatically applied — no code needed. The 25% reduction applies to your first three trips on any route." },
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
          <div className="final-offer">🎁 25% off your first 6 trips — waitlist only</div>
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
  <div className="footer-logo">Pair<span>.</span></div>
  <div className="footer-links">
    <a href="mailto:hello@pairmobility.com" className="footer-email">
      <svg className="email-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
      hello@pairmobility.com
    </a>
  </div>
  <p>Lagos, Nigeria · © 2026 Pair Mobility</p>
</footer>

        {/* SUCCESS MODAL */}
      {/* SUCCESS MODAL */}
<div className={`modal-overlay ${modalOpen ? 'active' : ''}`}>
  <div className="modal">
    <div className="modal-icon">🎉</div>
    <h3>Thank you, {submittedUser.firstName || 'Lagosian'}!</h3>
    <p>for joining the Pair waiting list. You will receive your Pair Early Access promo code on WhatsApp shortly. This code will be usable when Pair launches on July 1.</p>

    <div className="modal-offer">
      <div className="modal-offer-headline">25% off × 6 trips</div>
      <div className="modal-offer-sub">Applied automatically on your first 6 rides</div>
    </div>

    <div className="position-badge">
      <div className="position-label">Your waitlist position</div>
      <div>#{49 + waitlistCount.toLocaleString()}</div>
    </div>

    <p className="share-nudge">Move up the list — share with friends who commute on your route:</p>

    <button className="share-btn" onClick={shareWhatsApp}>
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Share on WhatsApp & move up the list
    </button>
    <button className="close-modal" onClick={closeModal}>Close</button>
  </div>
</div>
</div>
    </>
  );
}