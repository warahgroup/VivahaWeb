import { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface MahalAvailabilityFormProps {
  mahalId: string;
  mahalName: string;
}

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export function MahalAvailabilityForm({ mahalId, mahalName }: MahalAvailabilityFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    whatsapp_number: "",
    date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePhone = (phone: string): boolean => {
    // Remove any spaces or dashes
    const cleaned = phone.replace(/[\s-]/g, "");
    return INDIAN_PHONE_REGEX.test(cleaned);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSuccess(false);
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate phone number
    const cleanedPhone = formData.phone_number.replace(/[\s-]/g, "");
    if (!cleanedPhone) {
      newErrors.phone_number = "Phone number is required";
    } else if (!validatePhone(cleanedPhone)) {
      newErrors.phone_number = "Please enter a valid Indian phone number (10 digits starting with 6-9)";
    }

    // Validate WhatsApp number (if provided)
    if (formData.whatsapp_number) {
      const cleanedWhatsApp = formData.whatsapp_number.replace(/[\s-]/g, "");
      if (!validatePhone(cleanedWhatsApp)) {
        newErrors.whatsapp_number = "Please enter a valid Indian phone number (10 digits starting with 6-9)";
      }
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = "Please select a date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare form data for Formspree
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name.trim());
      formDataToSubmit.append("phone_number", cleanedPhone);
      formDataToSubmit.append("whatsapp_number", formData.whatsapp_number ? formData.whatsapp_number.replace(/[\s-]/g, "") : "");
      formDataToSubmit.append("date", formData.date);
      formDataToSubmit.append("mahal_name", mahalName);
      formDataToSubmit.append("mahal_id", mahalId);

      const response = await fetch("https://formspree.io/f/myzrjqnl", {
        method: "POST",
        body: formDataToSubmit,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setIsSuccess(true);
        // Reset form
        setFormData({
          name: "",
          phone_number: "",
          whatsapp_number: "",
          date: "",
        });
        // Scroll to success message
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="bg-card border border-card-border mt-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold text-lg">Thank you! We will update you shortly on WhatsApp.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-card-border mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-primary">Check Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? "border-destructive" : ""}
              required
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-base font-medium">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              placeholder="Enter 10-digit Indian phone number"
              maxLength={10}
              className={errors.phone_number ? "border-destructive" : ""}
              required
            />
            {errors.phone_number && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.phone_number}
              </p>
            )}
            {/* Warning message below phone number */}
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-800">
              We don't call and disturb you — only WhatsApp.
            </p>
          </div>

          {/* WhatsApp Number Field */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number" className="text-base font-medium">
              WhatsApp Number <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
              placeholder="Enter 10-digit Indian WhatsApp number"
              maxLength={10}
              className={errors.whatsapp_number ? "border-destructive" : ""}
            />
            {errors.whatsapp_number && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.whatsapp_number}
              </p>
            )}
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-medium">
              Select Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={errors.date ? "border-destructive" : ""}
              required
            />
            {errors.date && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Hidden fields for mahal info */}
          <input type="hidden" name="mahal_id" value={mahalId} />
          <input type="hidden" name="mahal_name" value={mahalName} />

          {/* Bottom note */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              We will update you in{" "}
              <span className="font-bold text-primary">10 minutes</span> through{" "}
              <span className="font-bold text-primary">WhatsApp</span>.
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Check Availability"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}





