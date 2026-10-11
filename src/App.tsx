import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DeveloperBubble from "./components/DeveloperBubble";
import Home from "./pages/Home";
import ImageGenerator from "./pages/ImageGenerator";
import IdeaGenerator from "./pages/IdeaGenerator";
import PromptLibrary from "./pages/PromptLibrary";
import Settings from "./pages/Settings";
import PromptImprover from "./pages/PromptImprover";
import PromptVariations from "./pages/PromptVariations";
import PromptExpander from "./pages/PromptExpander";
import PromptFixer from "./pages/PromptFixer";
import PromptBrainstormer from "./pages/PromptBrainstormer";
import SilhouettePromptFinder from "./pages/SilhouettePromptFinder";
import AdobeMetadata from "./pages/AdobeMetadata";
import ComplianceChecker from "./pages/ComplianceChecker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/image-generator" element={<ImageGenerator />} />
              <Route path="/idea-generator" element={<IdeaGenerator />} />
              <Route path="/prompt-library" element={<PromptLibrary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/prompt-improver" element={<PromptImprover />} />
              <Route path="/prompt-variations" element={<PromptVariations />} />
              <Route path="/prompt-expander" element={<PromptExpander />} />
              <Route path="/prompt-fixer" element={<PromptFixer />} />
                            <Route path="/prompt-brainstormer" element={<PromptBrainstormer />} />
              <Route path="/silhouette-finder" element={<SilhouettePromptFinder />} />
              <Route path="/adobe-metadata" element={<AdobeMetadata />} />
              <Route path="/compliance-checker" element={<ComplianceChecker />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <DeveloperBubble />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
