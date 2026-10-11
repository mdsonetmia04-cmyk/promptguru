import { Sparkles } from "lucide-react";

const Footer = () => (
  <footer className="border-t py-10 px-4 text-center">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-lg font-display font-bold gradient-text">PromptGuru</span>
      </div>
      <p className="text-sm text-muted-foreground">Bulk AI Prompt Generator for Creators</p>
      <p className="text-xs text-muted-foreground mt-1">Made for AI Artists, Designers and Adobe Stock Contributors</p>
    </div>
  </footer>
);

export default Footer;
