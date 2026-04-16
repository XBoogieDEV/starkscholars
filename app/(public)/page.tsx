"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  MapPin,
  Award,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Mail
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" ref={containerRef}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-4 group">
              {/* Logo */}
              <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
                <Image
                  src="/images/Stark2023_heritage.png"
                  alt="Stark Scholars Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold text-foreground tracking-tight">Stark Scholars</span>
                <span className="hidden sm:block text-[10px] uppercase tracking-widest text-primary font-bold">William R. Stark Financial Assistance Program</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              {['About', 'Eligibility', 'Timeline', 'Recipients'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login?redirect=/committee" className="hidden sm:block text-xs font-medium text-muted-foreground/60 hover:text-primary transition-colors">
                Committee
              </Link>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
                <Link href="/register">Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 overflow-hidden bg-white min-h-[90vh] flex items-center">
        {/* Background Elements */}
        <motion.div
          style={{ y, opacity }}
          className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-primary/5 to-transparent -z-10"
        />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left space-y-8"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors cursor-default">
                <Award className="w-3.5 h-3.5 text-primary" />
                Class of 2023 President&apos;s Club
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-[1.1]">
                Invest in Your <br />
                <span className="text-primary italic">Future Legacy</span>
              </motion.h1>

              {/* Body copy — static on desktop, cycling on mobile */}
              <motion.div variants={fadeInUp} className="max-w-xl mx-auto lg:mx-0">
                {/* Desktop: always show text */}
                <p className="hidden lg:block text-lg md:text-xl text-muted-foreground leading-relaxed">
                  The William R. Stark Financial Assistance Program awards prestigious scholarships
                  to students committed to academic excellence and community impact that reside in the
                  host state (Orient). This year its MICHIGAN!
                </p>

                {/* Mobile: cycle through text + 2 images */}
                <div className="lg:hidden relative h-[200px] overflow-hidden rounded-2xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {heroIndex === 0 ? (
                        <p className="text-lg text-muted-foreground leading-relaxed text-center px-2">
                          The William R. Stark Financial Assistance Program awards prestigious scholarships
                          to students committed to academic excellence and community impact that reside in the
                          host state (Orient). This year its MICHIGAN!
                        </p>
                      ) : heroIndex === 1 ? (
                        <div className="relative w-full h-full bg-secondary rounded-2xl flex items-center justify-center">
                          <div className="relative w-[160px] h-[160px] drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                            <Image src="/images/Stark2023_heritage.png" alt="Stark Scholars Heritage Logo" fill className="object-contain" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full rounded-2xl overflow-hidden">
                          <Image src="/images/hero-celebration.png" alt="Graduation celebration" fill className="object-cover" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Dot indicators (mobile only) */}
                <div className="lg:hidden flex justify-center gap-2 mt-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-300 ${heroIndex === i ? 'bg-primary' : 'bg-border'}`} />
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button asChild size="lg" className="rounded-xl h-14 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                  <Link href="/register">
                    Start Application
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl h-14 px-8 text-lg border-2 hover:bg-secondary/5">
                  <Link href="#about">Learn More</Link>
                </Button>
              </motion.div>

              {/* Stats Grid */}
              <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-8 pt-12 border-t border-border/50">
                {[
                  { val: "$500", label: "Award Amount" },
                  { val: "2", label: "Recipients" },
                  { val: "Apr 15", label: "Deadline", highlight: true }
                ].map((stat, i) => (
                  <motion.div key={i} variants={fadeInUp} className="space-y-1">
                    <p className="text-3xl font-serif font-bold text-foreground">{stat.val}</p>
                    <p className={`text-xs uppercase tracking-wider ${stat.highlight ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Image — Crossfade between logo and celebration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block h-[600px] w-full"
            >
              <div className="absolute inset-0 bg-secondary rounded-[2rem] rotate-3 transform translate-x-4 translate-y-4 opacity-10" />
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroIndex}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    {heroIndex % 2 === 0 ? (
                      <div className="relative w-full h-full bg-secondary flex items-center justify-center">
                        <div className="relative w-[550px] h-[550px] drop-shadow-[0_0_60px_rgba(212,175,55,0.4)]">
                          <Image
                            src="/images/Stark2023_heritage.png"
                            alt="Stark Scholars Heritage Logo"
                            fill
                            className="object-contain"
                            priority
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/hero-celebration.png"
                          alt="Diverse students celebrating graduation"
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl border border-border/50 max-w-xs z-10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Application Open</p>
                    <p className="text-sm text-muted-foreground">For 2026 Academic Year</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* About Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 order-2 md:order-1"
            >
              <Image
                src="/images/library-study.png"
                alt="Students studying in library"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8 order-1 md:order-2"
            >
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-primary mb-2 block">Our Mission</span>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Honoring a Legacy of Excellence</h3>
                <p className="text-lg text-secondary-foreground/80 leading-relaxed">
                  Established by the Class of 2023 President&apos;s Club, the William R. Stark Scholarship
                  honors a legacy of service. We exist to empower the next generation of global youth leaders
                  who demonstrate academic dedication and a heart for community service.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  { icon: BookOpen, title: "Educational Support", desc: "Providing financial assistance to help bridge the gap for deserving students pursuing higher education." },
                  { icon: Users, title: "Community Impact", desc: "We look beyond grades. We look for students who are using their education to create positive change." }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.1)" }}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 transition-colors"
                  >
                    <item.icon className="w-8 h-8 text-primary mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-secondary-foreground/70">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Eligibility Section - Editorial Design */}
      <section id="eligibility" className="py-32 bg-background">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-border/40 pb-12"
          >
            <motion.div variants={fadeInUp} className="max-w-2xl">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Requirements</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                Who We Are <br /> Looking For
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                The Stark Scholarship is designed for dedicated students ready to make a difference.
                Review the criteria below to determine your eligibility.
              </p>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Michigan Resident",
                desc: "Must be a current permanent resident of the State of Michigan.",
                image: "/images/eligibility-michigan.png",
                icon: MapPin
              },
              {
                title: "High School Senior",
                desc: "Must be graduating high school senior planning to enroll full-time.",
                image: "/images/eligibility-student.png",
                icon: GraduationCap
              },
              {
                title: "3.0+ GPA",
                desc: "Maintained a cumulative Grade Point Average of 3.0 or higher.",
                image: "/images/eligibility-gpa.png",
                icon: Award
              },
              {
                title: "First-Time Priority",
                desc: "Priority consideration is given to first-time scholarship applicants.",
                image: "/images/eligibility-first-time.png",
                icon: CheckCircle2
              },
              {
                title: "Service Oriented",
                desc: "History of volunteerism or community improvement projects.",
                image: "/images/eligibility-service.png",
                icon: Users
              },
              {
                title: "Personal Essay",
                desc: "A 450-550 word essay on improving your local community.",
                image: "/images/eligibility-essay.png",
                icon: FileText
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Background Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-500">
                  <div className="mb-4 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                      <item.icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-3xl font-serif font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>

                  <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                    <p className="text-white/80 text-lg leading-relaxed transform opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24 bg-secondary/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Application Timeline</h2>
            <p className="text-lg text-muted-foreground">
              Follow these key dates to ensure your application is considered.
            </p>
          </motion.div>

          <div className="relative">
            {/* Center Line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-primary/20 hidden md:block"
            />

            <div className="space-y-12">
              {[
                { date: "Feb 1, 2026", title: "Applications Open", desc: "Online portal opens for new registrations." },
                { date: "Apr 20, 2026", title: "Application Deadline", desc: "Final day to submit all required documents." },
                { date: "Apr 16 - Apr 26", title: "Review Period", desc: "Committee reviews all eligible applications." },
                { date: "Apr 27 - Apr 30", title: "Final Determinations", desc: "Recipients for awards are finalized." },
                { date: "May 1, 2026", title: "Award Recipients Notified", desc: "Award recipients notified via email." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className={`relative flex items-center justify-between md:justify-center group ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >

                  {/* Date Bubble */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-primary z-10 shadow-lg flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </motion.div>

                  <div className="hidden md:block w-1/2" />

                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                    <motion.div
                      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                      className={`bg-white p-6 rounded-2xl shadow-md border-l-4 border-primary transition-all duration-300 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
                    >
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2 uppercase tracking-wide">
                        {item.date}
                      </span>
                      <h3 className="text-xl font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Past Recipients Section */}
      <section id="recipients" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
              Our Scholars
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Past Recipients
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Celebrating the outstanding students who have been awarded the Stark Scholarship.
            </motion.p>
          </motion.div>

          {/* 2025 - Pennsylvania */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mb-10"
            >
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                2025 &mdash; Pennsylvania
              </span>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {[
                { name: "Kesmyn Mugo", initials: "KM", school: "Upper Merion Area '25", college: "College Undecided", major: "Biomedical Engineering", gpa: "5.5" },
                { name: "Justin Bowser", initials: "JB", school: "William Tennent HS '25", college: "Widener University", major: "Physical Therapy", gpa: "3.1" },
              ].map((recipient, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.1)" }}
                  className="bg-white rounded-2xl border border-border/50 p-8 shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-serif font-bold shadow-lg shrink-0">
                      {recipient.initials}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-foreground">{recipient.name}</h3>
                      <p className="text-sm text-muted-foreground">{recipient.school}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">College</span>
                      <span className="text-sm font-medium text-foreground">{recipient.college}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Major</span>
                      <span className="text-sm font-medium text-foreground">{recipient.major}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">GPA</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{recipient.gpa}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* 2024 - Wisconsin */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mb-10"
            >
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                2024 &mdash; Wisconsin
              </span>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {[
                { name: "William Bell", photo: "/images/recipients/william-bell.jpg", school: "Kingdom Prep Lutheran '24", college: "College Undecided", major: "IT", gpa: "3.4" },
                { name: "Joy Mitchell", photo: "/images/recipients/joy-mitchell.jpg", school: "U of Minnesota-Twin Cities", college: "U of Minnesota-Twin Cities", major: "Sports Management & Economics", gpa: "3.7" },
              ].map((recipient, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.1)" }}
                  className="bg-white rounded-2xl border border-border/50 p-8 shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-lg shrink-0">
                      <Image
                        src={recipient.photo}
                        alt={recipient.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-foreground">{recipient.name}</h3>
                      <p className="text-sm text-muted-foreground">{recipient.school}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">College</span>
                      <span className="text-sm font-medium text-foreground">{recipient.college}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Major</span>
                      <span className="text-sm font-medium text-foreground">{recipient.major}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">GPA</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{recipient.gpa}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-primary z-0"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0.8, 1], [0, -50]) }}
          className="absolute inset-0 bg-[url('/images/hero-celebration.png')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-white mb-6"
          >
            Ready to Shape Your Future?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/90 text-xl mb-10 max-w-2xl mx-auto"
          >
            The application deadline is <span className="font-bold underline text-white">April 20, 2026</span>.
            Don&apos;t wait to take the next step in your educational journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Button asChild size="lg" className="rounded-full h-16 px-10 text-lg bg-white text-secondary font-bold border-none hover:bg-white/90 shadow-2xl hover:scale-105 transition-transform duration-300">
              <Link href="/register">Create Account & Apply</Link>
            </Button>
            <Button asChild size="lg" className="rounded-full h-16 px-10 text-lg bg-secondary text-white font-bold border-2 border-secondary hover:bg-secondary/80 hover:border-white/30 shadow-xl hover:scale-105 transition-transform duration-300">
              <Link href="/login">Resume Application</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/Stark2023_heritage.png"
                    alt="Stark Scholars Logo"
                    fill
                    className="object-contain filter brightness-0 invert"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-serif font-bold text-white">Stark Scholars</span>
                  <span className="text-[10px] uppercase tracking-widest text-primary/80">Est. 2023</span>
                </div>
              </div>
              <p className="text-secondary-foreground/60 max-w-sm leading-relaxed">
                Empowering the next generation of Michigan leaders through financial
                assistance and community mentorship.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Navigation</h3>
              <ul className="space-y-4 text-sm text-secondary-foreground/60">
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Apply Now</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Contact</h3>
              <ul className="space-y-4 text-sm text-secondary-foreground/60">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <a href="mailto:blackgoldmine@sbcglobal.net" className="hover:text-primary transition-colors">
                    blackgoldmine@sbcglobal.net
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <span>Detroit, MI</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondary-foreground/40">
              © 2026 Stark Scholars. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
