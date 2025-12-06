import { useMahals } from "@/hooks/use-mahals";
import { useLocation } from "wouter";
import { Loader2, MapPin, Users, IndianRupee } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MahalList() {
  const { data: mahals, isLoading, error } = useMahals();
  const [, setLocation] = useLocation();

  const handleCardClick = (mahalId: string) => {
    setLocation(`/mahal/${mahalId}`);
  };

  const formatPrice = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Not Disclosed";
    if (min === max) return `₹${min.toLocaleString()}`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading mahals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load mahals</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (!mahals || mahals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">
            No mahals found
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for available venues
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Available Wedding Halls
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover beautiful venues for your special day
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mahals.map((mahal) => (
            <Card
              key={mahal.id}
              className="bg-card border border-card-border rounded-xl overflow-hidden hover-elevate transition-all cursor-pointer group"
              onClick={() => handleCardClick(mahal.id)}
              data-testid={`mahal-card-${mahal.id}`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {mahal.thumbnail ? (
                  <img
                    src={mahal.thumbnail}
                    alt={mahal.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4 line-clamp-2">
                  {mahal.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="line-clamp-1">{mahal.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      Capacity: {typeof mahal.capacity === "number" 
                        ? `${mahal.capacity.toLocaleString()} guests` 
                        : `${mahal.capacity} guests`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <IndianRupee className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      {formatPrice(mahal.priceRange.min, mahal.priceRange.max)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}





