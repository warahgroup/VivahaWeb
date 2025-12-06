import { useState, useEffect } from "react";
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
import { useMahal } from "@/hooks/use-mahals";
import { useUpdateMahal } from "@/hooks/use-mahal-admin";

interface AdminEditMahalProps {
  mahalId: string;
  onBack: () => void;
}

export function AdminEditMahal({ mahalId, onBack }: AdminEditMahalProps) {
  const { data: mahal, isLoading } = useMahal(mahalId);
  const updateMahal = useUpdateMahal();

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

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Load mahal data into form
  useEffect(() => {
    if (mahal) {
      setFormData({
        name: mahal.name || "",
        location: mahal.location || "",
        capacity: typeof mahal.capacity === "number" ? mahal.capacity.toString() : (mahal.capacity || ""),
        priceMin: mahal.priceRange?.min?.toString() || "",
        priceMax: mahal.priceRange?.max?.toString() || "",
        parking: mahal.parking || "",
        gasAvailability: typeof mahal.gasAvailability === "boolean" 
          ? (mahal.gasAvailability ? "yes" : "no")
          : (mahal.gasAvailability || ""),
        electricityBackup: typeof mahal.electricityBackup === "boolean"
          ? (mahal.electricityBackup ? "yes" : "no")
          : (mahal.electricityBackup || ""),
        ledLightSet: typeof mahal.ledLightSet === "boolean"
          ? (mahal.ledLightSet ? "yes" : "no")
          : (mahal.ledLightSet || ""),
        description: mahal.description || "",
        arrangementOrder: mahal.arrangementOrder?.toString() || "",
      });
      setExistingImages(mahal.images || []);
      setImagePreviews(mahal.images || []);
    }
  }, [mahal]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + images.length;
    
    if (files.length + totalImages > 3) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 3 images.",
        variant: "destructive",
      });
      return;
    }

    const newImages = files.slice(0, 3 - totalImages);
    setImages([...images, ...newImages]);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // Check if it's an existing image (starts with http) or new image (blob URL)
    const preview = imagePreviews[index];
    const isExistingImage = preview.startsWith("http");
    
    if (isExistingImage) {
      // Remove from existing images
      setExistingImages(existingImages.filter((_, i) => i !== index));
      setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    } else {
      // It's a new image (blob URL), find the corresponding file
      const existingCount = existingImages.length;
      const newImageIndex = index - existingCount;
      
      const newImages = images.filter((_, i) => i !== newImageIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      
      // Revoke object URL
      URL.revokeObjectURL(preview);
      
      setImages(newImages);
      setImagePreviews(newPreviews);
    }
  };

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

    try {
      await updateMahal.mutateAsync({
        id: mahalId,
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
        images: images.length > 0 ? images : undefined,
        existingImages: existingImages,
      });

      toast({
        title: "Mahal Updated Successfully!",
        description: "The mahal has been updated.",
      });

      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update mahal. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading mahal...</p>
        </div>
      </div>
    );
  }

  if (!mahal) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Mahal not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-serif text-primary">Edit Mahal</CardTitle>
            <CardDescription>Update mahal details and images</CardDescription>
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
                <Label>Images (up to 3)</Label>
                <div className="flex flex-col gap-4">
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={imagePreviews.length >= 3 || updateMahal.isPending}
                      className="h-11"
                    />
                    <span className="text-sm text-muted-foreground">{imagePreviews.length}/3</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload new images to replace existing ones. Leave empty to keep current images.
                  </p>
                </div>
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
                  disabled={updateMahal.isPending}
                >
                  {updateMahal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating Mahal...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Update Mahal
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

