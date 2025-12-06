import { useState } from "react";
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
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateMahal } from "@/hooks/use-mahal-upload";
import { MahalImageUrlInputs } from "@/components/admin/mahal-image-url-inputs";

interface AdminAddMahalProps {
  onBack: () => void;
}

export function AdminAddMahal({ onBack }: AdminAddMahalProps) {
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
    arrangementOrder: "",
  });

  const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.capacity || !formData.priceMin || !formData.priceMax || !formData.arrangementOrder) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including Arrangement Order.",
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
        capacity: formData.capacity.trim(),
        priceRange: {
          min: parseInt(formData.priceMin, 10),
          max: parseInt(formData.priceMax, 10),
        },
        parking: formData.parking || undefined,
        gasAvailability: formData.gasAvailability === "yes" ? true : formData.gasAvailability === "no" ? false : formData.gasAvailability || undefined,
        electricityBackup: formData.electricityBackup === "yes" ? true : formData.electricityBackup === "no" ? false : formData.electricityBackup || undefined,
        ledLightSet: formData.ledLightSet === "yes" ? true : formData.ledLightSet === "no" ? false : formData.ledLightSet || undefined,
        description: formData.description || undefined,
        arrangementOrder: formData.arrangementOrder ? parseInt(formData.arrangementOrder, 10) : undefined,
        imageUrls,
      });

      toast({
        title: "Mahal Added Successfully!",
        description: "The mahal has been added with all images uploaded.",
      });

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
        arrangementOrder: "",
      });
      setImageUrls(["", "", ""]);

      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add mahal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-serif text-primary">Add New Mahal</CardTitle>
            <CardDescription>Upload images and add details for a new wedding venue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Mahal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (number of guests) *</Label>
                <Input
                  id="capacity"
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  placeholder="e.g., 1000 or 1000-1500"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a single number (e.g., 1000) or a range (e.g., 1000-1500)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrangementOrder">Arrangement Order (Rank) *</Label>
                <Input
                  id="arrangementOrder"
                  type="number"
                  value={formData.arrangementOrder}
                  onChange={(e) => setFormData({ ...formData, arrangementOrder: e.target.value })}
                  required
                  min="1"
                  placeholder="Enter rank number (1 = first, 2 = second, etc.)"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first. Mahals are displayed in rank-wise order.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceMin">Min Price (₹) *</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                    required
                    min="0"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMax">Max Price (₹) *</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                    required
                    min="0"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image URLs *</Label>
                <MahalImageUrlInputs value={imageUrls} onChange={setImageUrls} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking">Parking Information</Label>
                <Input
                  id="parking"
                  value={formData.parking}
                  onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gasAvailability">Gas Availability</Label>
                <Select
                  value={formData.gasAvailability}
                  onValueChange={(value) => setFormData({ ...formData, gasAvailability: value })}
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

              <div className="space-y-2">
                <Label htmlFor="electricityBackup">Electricity Backup</Label>
                <Select
                  value={formData.electricityBackup}
                  onValueChange={(value) => setFormData({ ...formData, electricityBackup: value })}
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

              <div className="space-y-2">
                <Label htmlFor="ledLightSet">LED Light Set</Label>
                <Select
                  value={formData.ledLightSet}
                  onValueChange={(value) => setFormData({ ...formData, ledLightSet: value })}
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

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


