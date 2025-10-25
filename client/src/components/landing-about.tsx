import teamImage from "@assets/generated_images/Wedding_planning_team_photo_76b34099.png";

export function LandingAbout() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              About Us
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
              Vivaha is your trusted partner in creating unforgettable Indian wedding
              experiences. We are experts in Indian wedding planning, curating the
              latest trends and timeless traditions from comprehensive market research
              and cultural expertise.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Our mission is to blend tradition with innovation, ensuring every couple's
              special day reflects their unique love story while honoring the rich
              heritage of Indian ceremonies.
            </p>
          </div>
          <div>
            <img
              src={teamImage}
              alt="Vivaha wedding planning team"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
