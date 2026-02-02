// Simplified landing page without complex animations to prevent hydration errors
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-semibold text-gray-900">Stark Scholars</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#eligibility" className="text-gray-600 hover:text-gray-900">Eligibility</a>
              <a href="#apply" className="text-gray-600 hover:text-gray-900">How to Apply</a>
            </nav>
            <div className="flex gap-3">
              <a href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2">Sign In</a>
              <a href="/register" className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-600 font-medium mb-4">Class of 2023 President&apos;s Club</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Stark Scholars
          </h1>
          <h2 className="text-xl md:text-2xl text-amber-600 mb-6">
            William R. Stark Financial Assistance Program
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Empowering Michigan students to achieve their educational dreams and make a positive impact in their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-amber-700">
              Start Your Application
            </a>
            <a href="#about" className="bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50">
              Learn More
            </a>
          </div>
          <div className="mt-12 flex justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-600">$500</p>
              <p className="text-gray-600">Scholarship Awards</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">2</p>
              <p className="text-gray-600">Recipients Selected</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">April 15</p>
              <p className="text-gray-600">Application Deadline</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About the Program</h2>
              <p className="text-gray-600 mb-4">
                The William R. Stark Financial Assistance Program was established by the Class of 2023 President&apos;s Club 
                to honor the legacy of William R. Stark and support Michigan students pursuing higher education.
              </p>
              <p className="text-gray-600">
                We seek students who demonstrate academic dedication, community involvement, and a clear vision 
                for how their education will benefit others.
              </p>
            </div>
            <div className="bg-amber-50 p-8 rounded-2xl">
              <blockquote className="text-lg text-gray-700 italic">
                &quot;Education is the foundation upon which we build our future and the futures of those around us.&quot;
              </blockquote>
              <p className="text-amber-600 font-medium mt-4">— William R. Stark Scholarship Committee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Eligibility Requirements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-amber-600 text-xl">📍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Michigan Resident</h3>
              <p className="text-gray-600 text-sm">Must be a current resident of the State of Michigan</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-amber-600 text-xl">🎓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Full-Time Enrollment</h3>
              <p className="text-gray-600 text-sm">Enrolled or planning to enroll as a full-time student</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-amber-600 text-xl">⭐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Minimum 3.0 GPA</h3>
              <p className="text-gray-600 text-sm">Must have maintained a cumulative GPA of 3.0 or higher</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-amber-600 text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">First-Time Applicant</h3>
              <p className="text-gray-600 text-sm">Priority given to first-time scholarship applicants</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-amber-600 text-xl">📝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Two Recommendations</h3>
              <p className="text-gray-600 text-sm">Letters from educators or community leaders</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-amber-600 text-xl">📄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Essay Required</h3>
              <p className="text-gray-600 text-sm">450-550 word essay on community impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="apply" className="py-16 lg:py-24 bg-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Apply?</h2>
          <p className="text-amber-100 text-lg mb-8">
            Take the first step toward your educational future. Applications are due April 15, 2026.
          </p>
          <a href="/register" className="inline-block bg-white text-amber-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100">
            Create Your Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Stark Scholars</h3>
              <p className="text-sm">
                William R. Stark Financial Assistance Program<br />
                Supporting Michigan students since 2023.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/login" className="hover:text-white">Sign In</a></li>
                <li><a href="/register" className="hover:text-white">Apply Now</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <p className="text-sm">
                Questions? Email us at:<br />
                <a href="mailto:blackgoldmine@sbcglobal.net" className="text-amber-400 hover:text-amber-300">
                  blackgoldmine@sbcglobal.net
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Stark Scholars Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
