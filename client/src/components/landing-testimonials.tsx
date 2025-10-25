import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingTestimonialsProps {
  onBookConsult: () => void;
}

export function LandingTestimonials({ onBookConsult }: LandingTestimonialsProps) {
  const testimonials = [
    {
      name: "Priya & Arjun",
      quote: "Vivaha made our Sangeet night absolutely magical! The coordination was flawless and our guests are still talking about it.",
      rating: 5,
      initials: "PA"
    },
    {
      name: "Meera & Raj",
      quote: "From vendor selection to day-of management, everything was perfect. The AI chatbot helped us plan even during late nights!",
      rating: 5,
      initials: "MR"
    },
    {
      name: "Ananya & Vikram",
      quote: "Our destination wedding in Jaipur was a dream come true. Vivaha handled every detail with professionalism and care.",
      rating: 5,
      initials: "AV"
    },
    {
      name: "Kavya & Rohan",
      quote: "The team's cultural expertise ensured all our traditions were honored beautifully. Highly recommend for authentic Indian weddings!",
      rating: 5,
      initials: "KR"
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Couples Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real stories from happy couples we've had the honor to serve
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-card-border rounded-xl p-6 hover-elevate transition-all"
              data-testid={`card-testimonial-${index}`}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="text-sm text-card-foreground leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.initials}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {testimonial.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button
            size="lg"
            onClick={onBookConsult}
            data-testid="button-book-consult"
            className="text-lg px-8"
          >
            Book Free Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}
