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
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreatePackage } from "@/hooks/use-package-admin";

interface AdminAddPackageProps {
  onBack: () => void;
}

export function AdminAddPackage({ onBack }: AdminAddPackageProps) {
  const createPackage = useCreatePackage();

  const [formData, setFormData] = useState({
    name: "",
    priceMin: "",
    priceMax: "",
    realPrice: "",
    offerPrice: "",
    category: "",
    description: "",
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.priceMin || !formData.priceMax) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Min Price, Max Price).",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPackage.mutateAsync({
        name: formData.name,
        priceRange: {
          min: parseInt(formData.priceMin, 10),
          max: parseInt(formData.priceMax, 10),
        },
        realPrice: formData.realPrice ? parseFloat(formData.realPrice) : undefined,
        offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : undefined,
        category: formData.category || undefined,
        description: formData.description || undefined,
        image: formData.imageUrl || undefined,
      });

      toast({
        title: "Package Added Successfully!",
        description: "The package has been added.",
      });

      setFormData({
        name: "",
        priceMin: "",
        priceMax: "",
        realPrice: "",
        offerPrice: "",
        category: "",
        description: "",
        imageUrl: "",
      });
      setImagePreview(null);

      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add package. Please try again.",
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
            <CardTitle className="text-3xl font-serif text-primary">Add New Package</CardTitle>
            <CardDescription>Create a new wedding package</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="realPrice">Real Price (₹)</Label>
                  <Input
                    id="realPrice"
                    type="number"
                    value={formData.realPrice}
                    onChange={(e) => setFormData({ ...formData, realPrice: e.target.value })}
                    min="0"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                  <Input
                    id="offerPrice"
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    min="0"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Package Image</Label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative w-full max-w-xs">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, imageUrl: "" });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Input
                      type="url"
                      placeholder="Image URL"
                      value={formData.imageUrl}
                      onChange={handleImageUrlChange}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">OR</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="resize-none"
                  placeholder="Describe the package details..."
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={createPackage.isPending}
                >
                  {createPackage.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Package...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Add Package
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


