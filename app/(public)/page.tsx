// Simple static landing page that renders without JavaScript
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.25rem', color: '#111', textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: '#d97706', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>S</div>
            Stark Scholars
          </a>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#about" style={{ color: '#4b5563', textDecoration: 'none' }}>About</a>
            <a href="#eligibility" style={{ color: '#4b5563', textDecoration: 'none' }}>Eligibility</a>
            <a href="#apply" style={{ color: '#4b5563', textDecoration: 'none' }}>How to Apply</a>
          </nav>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/login" style={{ padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Sign In</a>
            <a href="/register" style={{ padding: '0.5rem 1rem', background: '#d97706', color: 'white', borderRadius: 6, textDecoration: 'none' }}>Apply Now</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(to bottom right, #fffbeb, #fff7ed)', padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <p style={{ color: '#d97706', fontWeight: 500, marginBottom: '1rem' }}>Class of 2023 President&apos;s Club</p>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>Stark Scholars</h1>
          <h2 style={{ fontSize: '1.5rem', color: '#d97706', marginBottom: '1rem' }}>William R. Stark Financial Assistance Program</h2>
          <p style={{ fontSize: '1.125rem', color: '#4b5563', maxWidth: 600, margin: '0 auto 2rem' }}>
            Empowering Michigan students to achieve their educational dreams and make a positive impact in their communities.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
            <a href="/register" style={{ padding: '1rem 2rem', background: '#d97706', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>Start Your Application</a>
            <a href="#about" style={{ padding: '1rem 2rem', background: 'white', color: '#374151', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>Learn More</a>
          </div>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
            <div><div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#d97706' }}>$500</div><div style={{ color: '#6b7280' }}>Scholarship Awards</div></div>
            <div><div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#d97706' }}>2</div><div style={{ color: '#6b7280' }}>Recipients Selected</div></div>
            <div><div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#d97706' }}>April 15</div><div style={{ color: '#6b7280' }}>Application Deadline</div></div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>About the Program</h2>
          <p style={{ fontSize: '1.125rem', color: '#4b5563', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            The William R. Stark Financial Assistance Program was established by the Class of 2023 President&apos;s Club 
            to honor the legacy of William R. Stark and support Michigan students pursuing higher education.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section id="eligibility" style={{ padding: '4rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>Eligibility Requirements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📍', title: 'Michigan Resident', desc: 'Must be a current resident of the State of Michigan' },
              { icon: '🎓', title: 'Full-Time Enrollment', desc: 'Enrolled or planning to enroll as a full-time student' },
              { icon: '⭐', title: 'Minimum 3.0 GPA', desc: 'Must have maintained a cumulative GPA of 3.0 or higher' },
            ].map((item) => (
              <div key={item.title} style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="apply" style={{ padding: '4rem 0', background: '#d97706', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Apply?</h2>
          <p style={{ fontSize: '1.125rem', color: '#fef3c7', marginBottom: '2rem' }}>Take the first step toward your educational future. Applications are due April 15, 2026.</p>
          <a href="/register" style={{ padding: '1rem 2rem', background: 'white', color: '#d97706', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>Create Your Account</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', color: '#9ca3af', padding: '3rem 0 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Stark Scholars</h3>
              <p>William R. Stark Financial Assistance Program<br />Supporting Michigan students since 2023.</p>
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Quick Links</h3>
              <a href="/login" style={{ color: '#9ca3af', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>Sign In</a>
              <a href="/register" style={{ color: '#9ca3af', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>Apply Now</a>
              <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>Terms of Service</a>
              <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>Privacy Policy</a>
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Contact</h3>
              <p>Questions? Email us at:</p>
              <a href="mailto:blackgoldmine@sbcglobal.net" style={{ color: '#d97706' }}>blackgoldmine@sbcglobal.net</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem', textAlign: 'center' }}>
            <p>&copy; 2026 Stark Scholars Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
