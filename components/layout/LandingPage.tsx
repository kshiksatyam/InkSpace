"use client";

import Link from "next/link";
import { PenLine, Sparkles, Globe, Users, TrendingUp, Star, ArrowUpRight } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

const FEATURES = [
  {
    icon: PenLine,
    title: "Distraction-free writing",
    description:
      "A minimal rich-text editor built for flow state. Format as you write, focus on what matters.",
  },
  {
    icon: Sparkles,
    title: "AI-powered summaries",
    description:
      "Generate crisp article previews with one click — so readers know exactly what they're getting.",
  },
  {
    icon: Globe,
    title: "Global discovery",
    description:
      "Tagged posts surface through search and trending topics, reaching readers who care.",
  },
  {
    icon: Users,
    title: "Real community",
    description:
      "Follow writers, collect followers, and build a readership around your ideas over time.",
  },
  {
    icon: TrendingUp,
    title: "Live trending",
    description:
      "Watch topics rise in real time. Jump into conversations while they're still forming.",
  },
  {
    icon: Star,
    title: "Personalised feed",
    description:
      "Surfaces posts from writers you follow, blended with fresh discoveries curated for you.",
  },
];

const STATS = [
  { value: "12k+", label: "Writers" },
  { value: "48k+", label: "Stories" },
  { value: "200k+", label: "Readers" },
];

const TESTIMONIALS = [
  {
    quote: "InkSpace gave me the audience I always dreamed of. The editor is a joy to write in.",
    author: "Priya S.",
    role: "Tech blogger",
    initials: "PS",
  },
  {
    quote: "Finally a blogging platform that feels modern and minimal. I write every day now.",
    author: "Marcus T.",
    role: "Fiction writer",
    initials: "MT",
  },
  {
    quote: "The AI summary feature saves me hours every week. My readers love the previews.",
    author: "Aiko W.",
    role: "Content creator",
    initials: "AW",
  },
];

export function LandingPage() {
  const { openModal } = useAuthModal();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#0c0c0c] text-[#efefef]">

      {/* ── Minimal nav bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0c0c0c]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[#E8C97A] font-bold tracking-tight text-lg">Ink</span>
          <span className="text-white font-bold tracking-tight text-lg">Space</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("login")}
            className="text-sm text-[#aaa] hover:text-white transition-colors px-3 py-1.5 cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => openModal("register")}
            className="text-sm bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-semibold px-4 py-1.5 rounded transition-colors cursor-pointer"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        {/* Ruled background texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,1) 31px, rgba(255,255,255,1) 32px)",
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-start">
          {/* Left: editorial headline */}
          <div>
            {/* Issue badge — editorial newspaper style */}
            <div className="inline-flex items-center gap-2 mb-10 text-xs uppercase tracking-[0.15em] text-[#E8C97A] font-semibold">
              <span className="w-4 h-px bg-[#E8C97A]" />
              The writer&apos;s platform
              <span className="w-4 h-px bg-[#E8C97A]" />
            </div>

            <h1 className="serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-[-0.03em] text-[#efefef] mb-6">
              Where ideas
              <br />
              find their
              <br />
              <em className="text-[#E8C97A] not-italic">readers.</em>
            </h1>

            <p className="text-lg text-[#888] leading-relaxed max-w-lg mb-10">
              InkSpace is a focused writing platform for people with something to say.
              Write beautifully, build a readership, and let AI do the heavy lifting.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-16">
              <button
                onClick={() => openModal("register")}
                className="inline-flex items-center gap-2 bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-semibold text-sm px-6 py-3 rounded transition-all duration-150 cursor-pointer"
              >
                Start writing — it&apos;s free
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => openModal("login")}
                className="inline-flex items-center gap-2 text-sm text-[#aaa] hover:text-white border border-white/10 hover:border-white/20 px-5 py-3 rounded transition-all duration-150 cursor-pointer"
              >
                Sign in
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8">
              {STATS.map(({ value, label }, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-[#efefef] tracking-tight">{value}</p>
                  <p className="text-xs text-[#666] mt-0.5 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: editorial article card column */}
          <div className="hidden lg:flex flex-col gap-3">
            {/* Masthead label */}
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-medium mb-1">
              Latest from InkSpace
            </p>
            {[
              {
                tag: "Philosophy",
                title: "The quiet discipline of writing every day",
                author: "Marcus T.",
                min: "5 min",
              },
              {
                tag: "Technology",
                title: "How AI is reshaping the craft of longform writing",
                author: "Aiko W.",
                min: "8 min",
              },
              {
                tag: "Culture",
                title: "Why newsletters are the new midnight radio",
                author: "Priya S.",
                min: "4 min",
              },
            ].map((article, i) => (
              <div
                key={i}
                className="border border-white/7 bg-[#131313] p-4 rounded-sm cursor-pointer group hover:border-white/12 hover:bg-[#161616] transition-all duration-150"
              >
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#E8C97A] font-semibold">
                  {article.tag}
                </span>
                <h3 className="text-sm font-semibold text-[#ddd] mt-1.5 mb-2 leading-snug group-hover:text-white transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-[#555]">
                  <span>{article.author}</span>
                  <span>·</span>
                  <span>{article.min} read</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20">
        <div className="border-t border-white/7" />
      </div>

      {/* ── Features — editorial list layout ── */}
      <section className="py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-0">
          {/* Section label */}
          <div className="md:col-span-2 mb-12">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-semibold">
              Platform features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#efefef] mt-2">
              Built for the act of writing.
            </h2>
          </div>

          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <div
              key={i}
              className="flex gap-5 py-7 border-t border-white/7 group"
            >
              <div className="mt-0.5 shrink-0 w-7 h-7 flex items-center justify-center text-[#E8C97A]">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#efefef] mb-1.5">{title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20">
        <div className="border-t border-white/7" />
      </div>

      {/* ── Testimonials — asymmetric staggered ── */}
      <section className="py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-semibold">
            From the community
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#efefef] mt-2">
            Writers who found their voice.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, author, role, initials }, i) => (
            <div
              key={i}
              className={`bg-[#131313] border border-white/7 p-7 rounded-sm ${i === 1 ? "md:mt-8" : ""}`}
            >
              {/* Pull-quote mark */}
              <div className="text-4xl text-[#E8C97A]/30 font-serif leading-none mb-4 select-none">&ldquo;</div>
              <p className="text-[#aaa] text-sm leading-relaxed mb-6 italic">{quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-[#E8C97A]/10 border border-[#E8C97A]/20 flex items-center justify-center text-[#E8C97A] text-xs font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#ddd]">{author}</p>
                  <p className="text-[11px] text-[#555]">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="py-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <div className="border border-[#E8C97A]/20 bg-[#E8C97A]/[0.03] rounded-sm p-10 md:p-16 text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8C97A]/60 font-semibold">
            Begin today
          </span>
          <h2 className="serif text-4xl md:text-5xl font-bold tracking-tight text-[#efefef] mt-4 mb-4">
            Your ideas deserve readers.
          </h2>
          <p className="text-[#777] text-base max-w-md mx-auto mb-10 leading-relaxed">
            Join thousands of writers who publish on InkSpace every day. Free to start, forever.
          </p>
          <button
            onClick={() => openModal("register")}
            className="inline-flex items-center gap-2 bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-bold text-sm px-8 py-3.5 rounded transition-all duration-150 cursor-pointer"
          >
            Create your free account
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 md:px-12 lg:px-20 py-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#E8C97A] font-bold">Ink</span>
            <span className="text-[#efefef] font-bold">Space</span>
          </div>
          <p className="text-[11px] text-[#444]">
            © {new Date().getFullYear()} InkSpace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
