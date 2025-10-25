import { Sparkles, Clock, IndianRupee, Users } from "lucide-react";
import mehndiImage from "@assets/generated_images/Traditional_mehndi_ceremony_illustration_978cab2b.png";
import timelineImage from "@assets/generated_images/Wedding_timeline_planning_visual_808825ec.png";

export function LandingGuide() {
  const guides = [
    {
      icon: Sparkles,
      title: "Traditions",
      stat: "Mehndi • Haldi • Sangeet",
      description: "Experience authentic ceremonies with our expert guidance on traditional rituals",
      image: mehndiImage
    },
    {
      icon: Clock,
      title: "Timeline",
      stat: "6-8 Months",
      description: "Ideal planning duration for a perfectly orchestrated celebration",
      image: timelineImage
    },
    {
      icon: IndianRupee,
      title: "Budget",
      stat: "₹20-25 Lakhs Average",
      description: "Flexible packages with transparent pricing and value optimization",
      image: null
    },
    {
      icon: Users,
      title: "Venues",
      stat: "200-500+ Guests",
      description: "Versatile venues for intimate gatherings to grand celebrations",
      image: null
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Indian Wedding Guide
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Essential insights for planning your perfect celebration
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="bg-background rounded-xl overflow-hidden hover-elevate transition-all group"
              data-testid={`card-guide-${index}`}
            >
              {guide.image && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className={guide.image ? "p-6" : "p-8"}>
                <guide.icon className="w-10 h-10 text-primary mb-3" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {guide.title}
                </h3>
                <p className="text-lg font-medium text-primary mb-3">
                  {guide.stat}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {guide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
