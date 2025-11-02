import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function VendorRegistrationPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    phoneNumber: "",
    serviceType: "",
    customServiceType: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomService, setShowCustomService] = useState(false);

  const serviceTypes = [
    "Catering",
    "Photography",
    "Decoration",
    "Makeup",
    "Venue",
    "Music & Entertainment",
    "Wedding Planner",
    "Mehndi Artist",
    "Florist",
    "DJ",
    "Bridal Boutique",
    "Jewelry",
    "Cake Designer",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName || !formData.contactName || !formData.phoneNumber || 
        !formData.serviceType || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to save vendor data
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Registration Successful!",
        description: "Thank you for registering your business. We'll get in touch soon.",
      });

      // Reset form
      setFormData({
        businessName: "",
        contactName: "",
        phoneNumber: "",
        serviceType: "",
        customServiceType: "",
        city: "",
      });
      setShowCustomService(false);

      // Optionally redirect after a delay
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData({ ...formData, serviceType: value, customServiceType: "" });
    setShowCustomService(value === "Other");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 to-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-lg border-purple-100">
          <CardHeader className="text-center space-y-3 pb-6">
            <CardTitle className="text-3xl font-serif text-primary">
              Join Vivaha as a Vendor
            </CardTitle>
            <CardDescription className="text-base">
              Register your business and connect with couples planning their dream wedding
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-base">
                  What is your business name? *
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="e.g., Royal Wedding Caterers"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  required
                  className="h-11"
                  data-testid="input-business-name"
                />
              </div>

              {/* Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-base">
                  What is your name (contact person)? *
                </Label>
                <Input
                  id="contactName"
                  type="text"
                  placeholder="e.g., Rajesh Kumar"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  required
                  className="h-11"
                  data-testid="input-contact-name"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-base">
                  What is your phone number? *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  required
                  className="h-11"
                  data-testid="input-phone-number"
                />
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType" className="text-base">
                  What type of service do you provide? *
                </Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={handleServiceTypeChange}
                  required
                >
                  <SelectTrigger className="h-11" data-testid="select-service-type">
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom Service Type Input */}
                {showCustomService && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="customServiceType" className="text-sm text-muted-foreground">
                      Please specify your service type *
                    </Label>
                    <Input
                      id="customServiceType"
                      type="text"
                      placeholder="Enter your service type"
                      value={formData.customServiceType}
                      onChange={(e) =>
                        setFormData({ ...formData, customServiceType: e.target.value })
                      }
                      required={showCustomService}
                      className="h-11"
                      data-testid="input-custom-service-type"
                    />
                  </div>
                )}
              </div>

              {/* City/Area */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-base">
                  Which city or area do you operate in? *
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                  className="h-11"
                  data-testid="input-city"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isSubmitting}
                  data-testid="button-submit-vendor"
                >
                  {isSubmitting ? "Registering..." : "Register My Business"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

