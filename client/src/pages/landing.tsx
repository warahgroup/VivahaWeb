import { useState } from "react";
import { useLocation } from "wouter";
import { LandingHeader } from "@/components/landing-header";
import { LandingHero } from "@/components/landing-hero";
import { LandingAbout } from "@/components/landing-about";
import { LandingWhoWeAre } from "@/components/landing-who-we-are";
import { LandingServices } from "@/components/landing-services";
import { LandingGuide } from "@/components/landing-guide";
import { LandingTestimonials } from "@/components/landing-testimonials";
import { LandingFooter } from "@/components/landing-footer";
import { AuthModal } from "@/components/auth-modal";
import { QuizModal } from "@/components/quiz-modal";
import { ConsultModal } from "@/components/consult-modal";
import type { QuizResponse } from "@shared/schema";
import { trackEvent } from "@/lib/analytics";

interface LandingPageProps {
  onLogin: (userId: string, email: string) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setAuthModalOpen(true);
    trackEvent("click", "auth", "get_started");
  };

  const handleAddVendor = () => {
    setLocation("/vendor-registration");
    trackEvent("click", "vendor", "add_vendor");
  };

  const handleTakeQuiz = () => {
    setQuizModalOpen(true);
    trackEvent("click", "quiz", "take_quiz");
  };

  const handleBookConsult = () => {
    setConsultModalOpen(true);
    trackEvent("click", "consult", "book_consultation");
  };

  const handleQuizComplete = (data: QuizResponse) => {
    setQuizModalOpen(false);
    // Store quiz in localStorage for immediate access
    localStorage.setItem("vivaha-quiz", JSON.stringify(data));
    trackEvent("complete", "quiz", "quiz_submission");
  };

  const handleAuthSuccess = (userId: string, email: string) => {
    setAuthModalOpen(false);
    onLogin(userId, email);
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader onGetStarted={handleGetStarted} onAddVendor={handleAddVendor} />
      <main className="pt-16 md:pt-20">
        <LandingHero onGetStarted={handleGetStarted} onTakeQuiz={handleTakeQuiz} />
        <LandingAbout />
        <LandingWhoWeAre />
        <LandingServices />
        <LandingGuide />
        <LandingTestimonials onBookConsult={handleBookConsult} />
      </main>
      <LandingFooter />

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
      <QuizModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
        onComplete={handleQuizComplete}
      />
      <ConsultModal
        open={consultModalOpen}
        onOpenChange={setConsultModalOpen}
      />
    </div>
  );
}
