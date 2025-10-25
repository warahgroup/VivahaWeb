import { Users, Award, Heart } from "lucide-react";

export function LandingWhoWeAre() {
  const team = [
    {
      icon: Users,
      title: "Expert Wedding Planners",
      description: "Seasoned professionals with years of experience in orchestrating flawless Indian weddings"
    },
    {
      icon: Award,
      title: "Creative Designers",
      description: "Visionary designers who bring your dream wedding aesthetic to life with stunning decor"
    },
    {
      icon: Heart,
      title: "Cultural Experts",
      description: "Deep understanding of Indian traditions ensuring authentic and meaningful ceremonies"
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who We Are
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A dedicated team committed to making your wedding journey seamless and memorable
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-8 hover-elevate transition-all"
              data-testid={`card-team-${index}`}
            >
              <member.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {member.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
