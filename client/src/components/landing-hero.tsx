import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Indian_wedding_hero_background_fb5c4560.png";

interface LandingHeroProps {
  onGetStarted: () => void;
  onTakeQuiz: () => void;
}

export function LandingHero({ onGetStarted, onTakeQuiz }: LandingHeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Hero Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Indian wedding celebration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 md:pt-24">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Plan Your Dream Indian Wedding with Vivaha
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Experience seamless wedding planning with our expert team, AI-powered
          chatbot, and curated vendor connections for authentic Indian ceremonies
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={onGetStarted}
            data-testid="button-get-started-hero"
            className="text-lg px-8 py-6 min-h-12"
          >
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onTakeQuiz}
            data-testid="button-take-quiz"
            className="text-lg px-8 py-6 min-h-12 backdrop-blur-md bg-white/20 border-white/40 text-white hover:bg-white/30"
          >
            Take Wedding Quiz
          </Button>
        </div>
      </div>
    </section>
  );
}
