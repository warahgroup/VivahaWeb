import { Heart } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-4">
              Vivaha
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted partner in creating unforgettable Indian wedding experiences
              with expert planning and cultural authenticity.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">
                About Us
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Services
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Wedding Guide
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Contact
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect With Us</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with the latest wedding trends and planning tips
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 text-sm rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0"
                data-testid="input-newsletter"
              />
              <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Copyright © 2025 Vivaha. Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for couples everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
