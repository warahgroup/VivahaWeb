import { Calendar, Users, Palette, Plane, Bot } from "lucide-react";

export function LandingServices() {
  const services = [
    {
      icon: Calendar,
      title: "Full Wedding Planning",
      description: "End-to-end planning from engagement to reception, handling every detail with precision"
    },
    {
      icon: Users,
      title: "Vendor Connections",
      description: "Curated network of trusted vendors including photographers, caterers, decorators, and more"
    },
    {
      icon: Palette,
      title: "Custom Themes",
      description: "Personalized decor themes that blend traditional aesthetics with modern elegance"
    },
    {
      icon: Plane,
      title: "Destination Wedding Support",
      description: "Seamless coordination for weddings at exotic locations across India and abroad"
    },
    {
      icon: Bot,
      title: "AI Chat Assistant",
      description: "24/7 intelligent chatbot providing instant answers, recommendations, and planning guidance"
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            What You Can Get
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive wedding planning services tailored to your needs
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card border border-card-border rounded-xl p-6 hover-elevate transition-all"
              data-testid={`card-service-${index}`}
            >
              <service.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
