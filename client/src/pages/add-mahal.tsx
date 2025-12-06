import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateMahal } from "@/hooks/use-mahal-upload";
import { MahalImageUrlInputs } from "@/components/admin/mahal-image-url-inputs";

export default function AddMahalPage() {
  const [, setLocation] = useLocation();
  const createMahal = useCreateMahal();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    priceMin: "",
    priceMax: "",
    parking: "",
    gasAvailability: "",
    electricityBackup: "",
    ledLightSet: "",
    description: "",
  });

  const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.location || !formData.capacity || !formData.priceMin || !formData.priceMax) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrls[0]?.trim()) {
      toast({
        title: "Missing Image URL",
        description: "Please provide at least the first image URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMahal.mutateAsync({
        name: formData.name,
        location: formData.location,
        capacity: parseInt(formData.capacity, 10),
        priceRange: {
          min: parseInt(formData.priceMin, 10),
          max: parseInt(formData.priceMax, 10),
        },
        parking: formData.parking || undefined,
        gasAvailability: formData.gasAvailability === "yes" ? true : formData.gasAvailability === "no" ? false : formData.gasAvailability || undefined,
        electricityBackup: formData.electricityBackup === "yes" ? true : formData.electricityBackup === "no" ? false : formData.electricityBackup || undefined,
        ledLightSet: formData.ledLightSet === "yes" ? true : formData.ledLightSet === "no" ? false : formData.ledLightSet || undefined,
        description: formData.description || undefined,
        imageUrls,
      });

      toast({
        title: "Mahal Added Successfully!",
        description: "The mahal has been added with all images uploaded.",
      });

      // Reset form
      setFormData({
        name: "",
        location: "",
        capacity: "",
        priceMin: "",
        priceMax: "",
        parking: "",
        gasAvailability: "",
        electricityBackup: "",
        ledLightSet: "",
        description: "",
      });
      setImageUrls(["", "", ""]);

      // Redirect to mahals list
      setTimeout(() => {
        setLocation("/mahals");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add mahal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 to-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Link href="/mahals">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mahals
          </Button>
        </Link>

        <Card className="shadow-lg border-purple-100">
          <CardHeader className="text-center space-y-3 pb-6">
            <CardTitle className="text-3xl font-serif text-primary">
              Add New Mahal
            </CardTitle>
            <CardDescription className="text-base">
              Upload images and add details for a new wedding venue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mahal Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Mahal Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Royal Wedding Hall"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base">
                  Location *
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-base">
                  Capacity (number of guests) *
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 500"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  required
                  min="1"
                  className="h-11"
                />
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceMin" className="text-base">
                    Min Price (₹) *
                  </Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.priceMin}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMin: e.target.value })
                    }
                    required
                    min="0"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMax" className="text-base">
                    Max Price (₹) *
                  </Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="e.g., 100000"
                    value={formData.priceMax}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMax: e.target.value })
                    }
                    required
                    min="0"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Image URL Inputs */}
              <div className="space-y-2">
                <Label className="text-base">Image URLs *</Label>
                <MahalImageUrlInputs value={imageUrls} onChange={setImageUrls} />
              </div>

              {/* Parking */}
              <div className="space-y-2">
                <Label htmlFor="parking" className="text-base">
                  Parking Information
                </Label>
                <Input
                  id="parking"
                  type="text"
                  placeholder="e.g., Parking available for 100 cars"
                  value={formData.parking}
                  onChange={(e) =>
                    setFormData({ ...formData, parking: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              {/* Gas Availability */}
              <div className="space-y-2">
                <Label htmlFor="gasAvailability" className="text-base">
                  Gas Availability
                </Label>
                <Select
                  value={formData.gasAvailability}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gasAvailability: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select gas availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Electricity Backup */}
              <div className="space-y-2">
                <Label htmlFor="electricityBackup" className="text-base">
                  Electricity Backup
                </Label>
                <Select
                  value={formData.electricityBackup}
                  onValueChange={(value) =>
                    setFormData({ ...formData, electricityBackup: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select electricity backup" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* LED Light Set */}
              <div className="space-y-2">
                <Label htmlFor="ledLightSet" className="text-base">
                  LED Light Set
                </Label>
                <Select
                  value={formData.ledLightSet}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ledLightSet: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select LED light set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter a detailed description of the mahal..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={createMahal.isPending}
                >
                  {createMahal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading Images & Creating Mahal...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Add Mahal
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


