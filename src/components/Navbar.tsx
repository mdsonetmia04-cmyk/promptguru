import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X, Sparkles, ChevronDown, Wand2, Shuffle, Maximize2, Wrench, Lightbulb, CircleDot, FileCheck2, ShieldCheck } from "lucide-react";

const mainNavItems = [
  { label: "Home", path: "/" },
  { label: "Bulk Image Prompt Generator", path: "/image-generator" },
  { label: "Idea Generator", path: "/idea-generator" },
  { label: "Prompt Library", path: "/prompt-library" },
];

const aiTools = [
  { label: "Prompt Improver", path: "/prompt-improver", icon: Wand2 },
  { label: "Prompt Variations", path: "/prompt-variations", icon: Shuffle },
  { label: "Prompt Expander", path: "/prompt-expander", icon: Maximize2 },
  { label: "Prompt Fixer", path: "/prompt-fixer", icon: Wrench },
  { label: "Prompt Brainstormer", path: "/prompt-brainstormer", icon: Lightbulb },
  { label: "Silhouette Finder", path: "/silhouette-finder", icon: CircleDot },
];

const adobeTools = [
  { label: "Adobe Metadata Generator", path: "/adobe-metadata", icon: FileCheck2 },
  { label: "Compliance Checker", path: "/compliance-checker", icon: ShieldCheck },
];

const Navbar = () => {
  const location = useLocation();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [adobeOpen, setAdobeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adobeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
      if (adobeRef.current && !adobeRef.current.contains(e.target as Node)) {
        setAdobeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isToolActive = aiTools.some((t) => location.pathname === t.path);
  const isAdobeActive = adobeTools.some((t) => location.pathname === t.path);

  return (
    <nav className="sticky top-0 z-50 glass-card border-b rounded-none px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          <span className="text-xl font-display font-bold gradient-text">PromptGuru</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* AI Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                isToolActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              AI Tools <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 glass-card rounded-lg border shadow-lg py-2 animate-fade-in-up">
                {aiTools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setToolsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      location.pathname === tool.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <tool.icon className="w-4 h-4" />
                    {tool.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Adobe Stock Dropdown */}
          <div className="relative" ref={adobeRef}>
            <button
              onClick={() => setAdobeOpen(!adobeOpen)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                isAdobeActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Adobe Stock <ChevronDown className={`w-4 h-4 transition-transform ${adobeOpen ? "rotate-180" : ""}`} />
            </button>
            {adobeOpen && (
              <div className="absolute top-full left-0 mt-2 w-60 glass-card rounded-lg border shadow-lg py-2 animate-fade-in-up">
                {adobeTools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setAdobeOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      location.pathname === tool.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <tool.icon className="w-4 h-4" />
                    {tool.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/settings"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Settings
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden mt-3 pb-3 flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Tools</div>
          {aiTools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                location.pathname === tool.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tool.icon className="w-4 h-4" />
              {tool.label}
            </Link>
          ))}
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adobe Stock</div>
          {adobeTools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                location.pathname === tool.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tool.icon className="w-4 h-4" />
              {tool.label}
            </Link>
          ))}
          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Settings
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
