import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Users, IndianRupee, Car, Zap, Lightbulb, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMahal } from "@/hooks/use-mahals";
import { Loader2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MahalAvailabilityForm } from "@/components/mahal-availability-form";

interface MahalDetailsProps {
  params?: { id?: string };
}

export default function MahalDetails({ params }: MahalDetailsProps) {
  const [, setLocation] = useLocation();
  const mahalId = params?.id;
  const { data: mahal, isLoading } = useMahal(mahalId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading mahal details...</p>
        </div>
      </div>
    );
  }

  if (!mahal) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Button
            variant="ghost"
            onClick={() => setLocation("/mahals")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mahals
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Mahal not found
            </h1>
            <p className="text-muted-foreground">
              The mahal you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Not Disclosed";
    if (min === max) return `₹${min.toLocaleString()}`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const formatBoolean = (value: boolean | string | undefined): string => {
    if (value === undefined || value === null) return "Not specified";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const getBooleanIcon = (value: boolean | string | undefined) => {
    if (value === undefined || value === null) return null;
    const isTrue = typeof value === "boolean" ? value : String(value).toLowerCase() === "yes" || String(value).toLowerCase() === "true";
    return isTrue ? (
      <Check className="h-5 w-5 text-emerald-600" />
    ) : (
      <X className="h-5 w-5 text-red-600" />
    );
  };

  // Get images array (2-3 images)
  const displayImages = mahal.images && mahal.images.length > 0 
    ? mahal.images.slice(0, 3) 
    : mahal.thumbnail 
    ? [mahal.thumbnail] 
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button
          variant="ghost"
          onClick={() => setLocation("/mahals")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mahals
        </Button>

        {/* Images Gallery */}
        {displayImages.length > 0 && (
          <div className="mb-8">
            {displayImages.length === 1 ? (
              <div className="relative aspect-video w-full overflow-hidden bg-muted rounded-xl">
                <img
                  src={displayImages[0]}
                  alt={mahal.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className={`grid gap-4 ${
                displayImages.length === 2 
                  ? "grid-cols-1 md:grid-cols-2" 
                  : "grid-cols-1 md:grid-cols-3"
              }`}>
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-video w-full overflow-hidden bg-muted rounded-xl"
                  >
                    <img
                      src={image}
                      alt={`${mahal.name} - Image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                {mahal.name}
              </h1>
              
              {/* Basic Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="bg-card border border-card-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Location</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{mahal.location}</p>
                </Card>
                
                <Card className="bg-card border border-card-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Capacity</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {typeof mahal.capacity === "number" 
                      ? `${mahal.capacity.toLocaleString()} guests` 
                      : `${mahal.capacity} guests`}
                  </p>
                </Card>
                
                <Card className="bg-card border border-card-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Price Range</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatPrice(mahal.priceRange.min, mahal.priceRange.max)}
                  </p>
                </Card>
              </div>
            </div>

            {/* Description */}
            {mahal.description && (
              <Card className="bg-card border border-card-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  About This Venue
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {mahal.description}
                </p>
              </Card>
            )}
          </div>

          {/* Right Column - Amenities */}
          <div className="lg:col-span-1">
            <Card className="bg-card border border-card-border p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Amenities & Facilities
              </h2>
              
              <div className="space-y-4">
                {/* Parking */}
                {mahal.parking && (
                  <div className="flex items-start gap-3">
                    <Car className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Parking</p>
                      <p className="text-sm text-muted-foreground">{mahal.parking}</p>
                    </div>
                  </div>
                )}

                {/* Gas Availability */}
                {(mahal.gasAvailability !== undefined && mahal.gasAvailability !== null && mahal.gasAvailability !== "") && (
                  <div className="flex items-start gap-3">
                    <Flame className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">Gas Availability</p>
                        {getBooleanIcon(mahal.gasAvailability)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatBoolean(mahal.gasAvailability)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Electricity Backup */}
                {(mahal.electricityBackup !== undefined && mahal.electricityBackup !== null && mahal.electricityBackup !== "") && (
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">Electricity Backup</p>
                        {getBooleanIcon(mahal.electricityBackup)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatBoolean(mahal.electricityBackup)}
                      </p>
                    </div>
                  </div>
                )}

                {/* LED Light Set */}
                {(mahal.ledLightSet !== undefined && mahal.ledLightSet !== null && mahal.ledLightSet !== "") && (
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">LED Light Set</p>
                        {getBooleanIcon(mahal.ledLightSet)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatBoolean(mahal.ledLightSet)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Availability Form */}
        <MahalAvailabilityForm mahalId={mahal.id} mahalName={mahal.name} />
      </div>
    </div>
  );
}

