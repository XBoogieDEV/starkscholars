"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, 
  MapPin, 
  Award, 
  FileText, 
  Users, 
  CheckCircle2,
  Calendar,
  ArrowRight,
  BookOpen,
  Mail
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              {/* Logo */}
              <div className="relative w-10 h-10">
                <Image
                  src="/images/SS-LOGO1.png"
                  alt="Stark Scholars Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Stark Scholars</span>
                <span className="hidden sm:block text-xs text-amber-600">William R. Stark Financial Assistance Program</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-gray-600 hover:text-amber-600 transition-colors">About</a>
              <a href="#eligibility" className="text-gray-600 hover:text-amber-600 transition-colors">Eligibility</a>
              <a href="#process" className="text-gray-600 hover:text-amber-600 transition-colors">How to Apply</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-gray-600 hover:text-gray-900 px-4 py-2">
                Sign In
              </Link>
              <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                <Link href="/register">Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                Class of 2023 President&apos;s Club
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Invest in Your
                <span className="text-amber-600 block">Educational Future</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                The William R. Stark Financial Assistance Program awards scholarships 
                to Michigan students committed to using their education to improve their communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8">
                  <Link href="/register">
                    Start Your Application
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-gray-300">
                  <Link href="#about">Learn More</Link>
                </Button>
              </div>
              {/* Stats */}
              <div className="flex gap-8 justify-center lg:justify-start">
                <div>
                  <p className="text-3xl font-bold text-amber-600">$500</p>
                  <p className="text-sm text-gray-600">Awards</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">2</p>
                  <p className="text-sm text-gray-600">Recipients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">April 15</p>
                  <p className="text-sm text-gray-600">Deadline</p>
                </div>
              </div>
            </div>
            {/* Hero Image - simage1.jpeg */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/simage1.jpeg"
                  alt="Students achieving academic success"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About the Program</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Established by the Class of 2023 President&apos;s Club to honor the legacy of William R. Stark
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <BookOpen className="w-8 h-8 text-amber-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                  <p className="text-gray-600">
                    To support Michigan students in their pursuit of higher education and empower them 
                    to make positive impacts in their communities.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-amber-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Who We Look For</h3>
                  <p className="text-gray-600">
                    Students who demonstrate academic dedication, community involvement, and a clear 
                    vision for how their education will benefit others.
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* About Image - simage2.jpeg */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/simage2.jpeg"
                alt="Students in classroom"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Eligibility Requirements</h2>
            <p className="text-lg text-gray-600">Make sure you meet all the criteria before applying</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: "Michigan Resident", desc: "Must be a current resident of the State of Michigan" },
              { icon: GraduationCap, title: "Full-Time Student", desc: "Enrolled or planning to enroll full-time at an accredited institution" },
              { icon: Award, title: "3.0+ GPA", desc: "Must have maintained a cumulative GPA of 3.0 or higher" },
              { icon: CheckCircle2, title: "First-Time Preferred", desc: "Priority given to first-time scholarship applicants" },
              { icon: FileText, title: "Two Recommendations", desc: "Letters from educators or community leaders required" },
              { icon: BookOpen, title: "Essay", desc: "450-550 words on 'How Will Furthering My Studies Help Me Improve My Community?'" },
            ].map((item, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <item.icon className="w-10 h-10 text-amber-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Application Process</h2>
            <p className="text-lg text-gray-600">Follow these steps to complete your application</p>
          </div>
          
          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {[
              { step: "1", title: "Create Account", desc: "Register on our platform" },
              { step: "2", title: "Complete Application", desc: "Fill out all 7 sections" },
              { step: "3", title: "Get Recommendations", desc: "Request 2 letters" },
              { step: "4", title: "Submit", desc: "Review and submit by April 15" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Process Image Grid - simage3.jpeg and simage4.jpeg */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/simage3.jpeg"
                alt="Student studying"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/simage4.jpeg"
                alt="Academic achievement"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Student Success Section */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Student Image - simage5.jpeg */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1">
              <Image
                src="/images/simage5.jpeg"
                alt="Graduation celebration"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Investing in Michigan&apos;s Future Leaders
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Your education is the foundation for building a better community. Our scholarship 
                recipients go on to make meaningful impacts across Michigan and beyond.
              </p>
              <blockquote className="border-l-4 border-amber-500 pl-6 italic text-gray-700">
                &quot;Education is the foundation upon which we build our future and the futures of those around us.&quot;
              </blockquote>
              <p className="mt-4 text-amber-600 font-medium">— William R. Stark Scholarship Committee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - simag6.jpeg */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Success Stories</h2>
            <p className="text-gray-600">See the impact of the William R. Stark Scholarship</p>
          </div>
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
            <Image
              src="/images/simag6.jpeg"
              alt="Student success story"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Apply?</h2>
          <p className="text-amber-100 text-lg mb-8">
            Applications are due April 15, 2026. Take the first step toward your educational future today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-amber-600 hover:bg-gray-100 px-8">
              <Link href="/register">Create Your Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-amber-700">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/images/SS-LOGO1.png"
                    alt="Stark Scholars Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-white">Stark Scholars</span>
              </div>
              <p className="text-sm mb-4">
                William R. Stark Financial Assistance Program<br />
                Supporting Michigan students in their educational journey.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">Apply Now</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:blackgoldmine@sbcglobal.net" className="hover:text-amber-400">
                    blackgoldmine@sbcglobal.net
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Stark Scholars Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
