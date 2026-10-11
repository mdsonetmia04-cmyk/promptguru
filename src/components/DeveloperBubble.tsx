import { useState } from "react";
import { X, ExternalLink, Phone, Code2, Heart } from "lucide-react";
import qrCode from "@/assets/mdsonetmia_qr.png";

const DeveloperBubble = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button with ripple rings */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-btn flex items-center justify-center animate-pulse-glow group"
        aria-label="Developer info"
      >
        {/* Ping rings */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping-slow" />
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slower" />
        <Heart className="w-6 h-6 text-primary-foreground relative z-10 group-hover:scale-125 transition-transform duration-300 fill-current" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-card p-6 max-w-sm w-full relative animate-scale-in-bounce"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/15 blur-[50px] pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-secondary/15 blur-[40px] pointer-events-none" />

            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors z-10">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">Developer Info</h3>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-foreground">Md Sonet Mia</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">WhatsApp</p>
                    <p className="text-sm font-semibold text-foreground">01797953059</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Website</p>
                  <a
                    href="https://mdsonetmia.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline mb-3 font-medium"
                  >
                    mdsonetmia.vercel.app <ExternalLink className="w-3 h-3" />
                  </a>
                  <img
                    src={qrCode}
                    alt="QR Code to developer website"
                    className="w-36 h-36 mx-auto rounded-lg border border-border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeveloperBubble;
