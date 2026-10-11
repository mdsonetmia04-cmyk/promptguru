import { Link } from "react-router-dom";
import { Image, Lightbulb, BookOpen, Zap, ArrowRight, Sparkles, Wand2, Stars, FileCheck2, ShieldCheck } from "lucide-react";
import ParticleField from "@/components/ParticleField";

const features = [
  { icon: FileCheck2, title: "Adobe Metadata Generator", desc: "Titles, 25-35 keywords & categories per Adobe's rules" },
  { icon: ShieldCheck, title: "Compliance Checker", desc: "Instant Adobe-readiness score with fix tips" },
  { icon: Image, title: "Bulk Image Prompt Generator", desc: "Upload up to 100 images and generate prompts instantly" },
  { icon: Zap, title: "5 Free AI Providers", desc: "Any one key powers the whole site — with auto-fallback" },
  { icon: Lightbulb, title: "Idea to Prompt Generator", desc: "Turn any concept into dozens of AI-ready prompts" },
  { icon: BookOpen, title: "Prompt Library", desc: "Browse curated prompts by category for inspiration" },
];

const floatingIcons = [
  { icon: Sparkles, className: "top-[10%] left-[8%] animate-float-slow text-primary/30 w-8 h-8" },
  { icon: Wand2, className: "top-[20%] right-[12%] animate-float-mid text-secondary/25 w-10 h-10 rotate-12" },
  { icon: Stars, className: "bottom-[25%] left-[15%] animate-float-fast text-primary/20 w-7 h-7" },
  { icon: Zap, className: "top-[60%] right-[8%] animate-float-slow text-secondary/20 w-9 h-9 -rotate-12" },
  { icon: Lightbulb, className: "top-[75%] left-[5%] animate-float-mid text-primary/15 w-6 h-6" },
  { icon: Image, className: "bottom-[10%] right-[18%] animate-float-fast text-secondary/15 w-8 h-8 rotate-6" },
];

const Home = () => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    {/* Hero */}
    <section className="relative text-center py-16 lg:py-28 overflow-hidden">
      <ParticleField />

      {/* Floating Icons with enhanced animations */}
      {floatingIcons.map((item, i) => (
        <item.icon key={i} className={`absolute hidden sm:block ${item.className} hover:scale-125 transition-transform duration-500`} />
      ))}

      {/* Enhanced Glowing orbs with multiple layers */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-primary/15 to-secondary/10 blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-gradient-to-l from-secondary/15 to-primary/10 blur-[100px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[150px] animate-pulse pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-semibold text-primary mb-6 animate-fade-in-up">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Prompt Generation
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-100">
          Generate AI Prompts{" "}
          <span className="gradient-text animate-shimmer bg-[length:200%_100%]">Instantly</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
          Turn Images or Ideas into Powerful AI Prompts Automatically
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
          <Link to="/image-generator" className="gradient-btn px-8 py-3.5 flex items-center justify-center gap-2 group animate-pulse-glow">
            <Image className="w-5 h-5 animate-bounce" /> Bulk Image Prompt Generator
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/idea-generator" className="gradient-btn-secondary px-8 py-3.5 flex items-center justify-center gap-2 group">
            <Lightbulb className="w-5 h-5" /> Generate From Ideas
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-12">
      <h2 className="text-2xl font-display font-bold text-center mb-10 text-foreground animate-fade-in-up">
        <span className="gradient-text animate-shimmer bg-[length:200%_100%]">Powerful Features</span>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="glass-card p-6 hover:scale-[1.05] hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 group animate-fade-in-up border border-transparent hover:border-primary/30"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/40 group-hover:to-secondary/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <f.icon className="w-7 h-7 text-primary group-hover:animate-pulse" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
            <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
