import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { trackEvent } from "@/lib/analytics";

export function LandingMahalAvailability() {
  const [, setLocation] = useLocation();

  const handleCheckAvailability = () => {
    trackEvent("click", "mahal", "check_availability");
    setLocation("/mahals");
  };

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Your Perfect Wedding Venue
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover and check availability for the most beautiful wedding halls and venues across India
          </p>
          <Button
            size="lg"
            onClick={handleCheckAvailability}
            data-testid="button-check-mahal-availability"
            className="text-lg px-8 py-6 min-h-12"
          >
            Check Mahal Availability
          </Button>
        </div>
      </div>
    </section>
  );
}






