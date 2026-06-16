"use client";

import Link from "next/link";
import { BookOpen, PenLine, Sparkles, Globe, Users, TrendingUp, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: PenLine,
    title: "Write Beautifully",
    description:
      "A distraction-free rich-text editor that lets your ideas shine. Format with ease, focus on writing.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description:
      "Let AI generate smart summaries of your posts so readers can preview your ideas at a glance.",
  },
  {
    icon: Globe,
    title: "Reach the World",
    description:
      "Publish your stories and have them discovered by readers globally through tags and search.",
  },
  {
    icon: Users,
    title: "Build Your Audience",
    description:
      "Follow writers, get followers, and build a community around the topics you love.",
  },
  {
    icon: TrendingUp,
    title: "Trending Tags",
    description:
      "Stay on top of what's trending. Discover popular topics and growing conversations in real time.",
  },
  {
    icon: Star,
    title: "Curated For You",
    description:
      "A personalised feed that surfaces stories from writers you follow alongside fresh discoveries.",
  },
];

const TESTIMONIALS = [
  {
    quote: "InkSpace gave me the audience I always dreamed of. The editor is a joy to write in.",
    author: "Priya S.",
    role: "Tech Blogger",
    initials: "PS",
  },
  {
    quote: "Finally a blogging platform that feels modern and minimal. I write every day now.",
    author: "Marcus T.",
    role: "Fiction Writer",
    initials: "MT",
  },
  {
    quote: "The AI summary feature saves me hours every week. My readers love the previews.",
    author: "Aiko W.",
    role: "Content Creator",
    initials: "AW",
  },
];

/** Animated floating ink-drop blobs for the hero background */
function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large ambient blobs */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(220 70% 60%), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(280 60% 60%), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(340 70% 60%), transparent 70%)" }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

/** Animated word cycling in the hero headline */
function CyclingWord({ words }: { words: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let idx = 0;
    const tick = () => {
      if (!ref.current) return;
      ref.current.style.opacity = "0";
      ref.current.style.transform = "translateY(-8px)";
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        if (ref.current) {
          ref.current.textContent = words[idx];
          ref.current.style.opacity = "1";
          ref.current.style.transform = "translateY(0)";
        }
      }, 300);
    };
    const id = setInterval(tick, 2400);
    return () => clearInterval(id);
  }, [words]);

  return (
    <span
      ref={ref}
      className="inline-block transition-all duration-300 ease-out bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
    >
      {words[0]}
    </span>
  );
}

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[92vh] text-center px-4 pt-24 pb-16">
        <HeroBg />

        {/* Badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          <span>Now with AI-powered writing tools</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        {/* Headline */}
        <h1 className="relative max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
          The place where{" "}
          <CyclingWord
            words={["ideas", "stories", "knowledge", "voices"]}
          />{" "}
          <br className="hidden sm:block" />
          come to life.
        </h1>

        {/* Sub-headline */}
        <p className="relative mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
          InkSpace is a modern blogging platform built for writers who care
          about their craft. Write, share, and grow your audience — all in one
          beautiful space.
        </p>

        {/* CTAs */}
        <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.03]"
            >
              Start writing for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base font-semibold hover:scale-[1.03] transition-all"
            >
              Sign in
            </Button>
          </Link>
        </div>

        {/* Social proof micro-stats */}
        <div className="relative mt-14 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          {[
            ["✍️", "Writers worldwide"],
            ["📖", "Stories published"],
            ["🌟", "Free forever"],
          ].map(([emoji, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Mock preview card */}
        <div className="relative mt-16 w-full max-w-3xl mx-auto">
          <div
            className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px -12px rgba(0,0,0,0.15)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <span className="h-3 w-3 rounded-full bg-green-400/70" />
              <span className="ml-3 flex-1 text-xs text-muted-foreground text-center">
                inkspace.app
              </span>
            </div>

            {/* Fake feed preview */}
            <div className="p-6 space-y-4 text-left">
              {[
                {
                  title: "The Future of AI-Powered Writing",
                  excerpt:
                    "AI tools are transforming how we create content. With tools like InkSpace, writers can focus on their ideas while AI handles summaries and organisation.",
                  tag: "#ai",
                  author: "Kaushik",
                  time: "2 min read",
                },
                {
                  title: "Why Minimalism Makes Better Writers",
                  excerpt:
                    "Distraction-free writing environments push us to think more deeply. Here's how stripping away the noise helps your best ideas surface.",
                  tag: "#writing",
                  author: "Priya S.",
                  time: "4 min read",
                },
              ].map((post) => (
                <div
                  key={post.title}
                  className="flex gap-4 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {post.author[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.author} · {post.time}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="mt-1 inline-block text-[11px] text-violet-500 font-medium">
                      {post.tag}
                    </span>
                  </div>
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-muted/60 to-muted flex-shrink-0 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Glow under preview */}
          <div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 blur-3xl rounded-full opacity-20"
            style={{ background: "linear-gradient(to right, violet, purple, pink)" }}
            aria-hidden
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-24 px-4 bg-muted/30">
        {/* Section header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for writers, by writers
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            InkSpace combines a beautiful editor with smart tools so you can
            spend more time writing and less time on everything else.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-violet-500/30"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 group-hover:from-violet-500/20 group-hover:to-purple-500/20 transition-all">
                <Icon className="h-5 w-5 text-violet-500" />
              </div>
              <h3 className="font-semibold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

              {/* Subtle corner glow on hover */}
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ background: "radial-gradient(circle, violet, transparent)" }}
                aria-hidden
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">
            Simple as ink
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start publishing in minutes
          </h2>
        </div>

        <div className="mx-auto max-w-3xl">
          {[
            {
              step: "01",
              title: "Create your account",
              desc: "Sign up in seconds — no credit card required. Just your name and email.",
            },
            {
              step: "02",
              title: "Write your first story",
              desc: "Open the editor, type your ideas, and format them with our clean, powerful toolbar.",
            },
            {
              step: "03",
              title: "Publish & grow",
              desc: "Hit publish, add tags, and watch your story reach readers around the world.",
            },
          ].map(({ step, title, desc }, i) => (
            <div key={step} className="flex gap-6 mb-10 last:mb-0">
              {/* Step connector */}
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/20">
                  {step}
                </div>
                {i < 2 && (
                  <div className="mt-2 w-px flex-1 bg-gradient-to-b from-violet-500/40 to-transparent" style={{ minHeight: 32 }} />
                )}
              </div>

              {/* Content */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold mb-1">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">
            Loved by writers
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            What our community says
          </h2>
        </div>

        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, author, role, initials }) => (
            <div
              key={author}
              className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-xl hover:border-violet-500/20 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{author}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-28 px-4 text-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(270 70% 60%), transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to share your story?
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Join InkSpace today — it&apos;s completely free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-10 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.03] transition-all"
              >
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-10 text-base font-semibold hover:scale-[1.03] transition-all"
              >
                Already have an account?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
