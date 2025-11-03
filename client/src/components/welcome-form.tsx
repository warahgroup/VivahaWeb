import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot } from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";

interface WelcomeFormProps {
  onSubmit: (name: string, phone: string, functionDate: string) => void;
  isSubmitting: boolean;
}

// Indian mobile number validation: exactly 10 digits starting with 6, 7, 8, or 9
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function WelcomeForm({ onSubmit, isSubmitting }: WelcomeFormProps) {
  const [state, handleSubmit] = useForm("xldokpyy");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [functionDate, setFunctionDate] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (phoneValue: string) => {
    // Remove any spaces or special characters
    const cleanPhone = phoneValue.replace(/\s+/g, "").replace(/[^\d]/g, "");
    
    if (!cleanPhone) {
      setPhoneError("");
      return false;
    }

    if (cleanPhone.length > 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }

    if (!INDIAN_MOBILE_REGEX.test(cleanPhone)) {
      setPhoneError("Must be 10 digits starting with 6, 7, 8, or 9");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "").replace(/[^\d]/g, "");
    setPhone(value);
    validatePhone(value);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "");
    
    if (name.trim() && validatePhone(cleanPhone) && functionDate) {
      // Submit to Formspree
      await handleSubmit(e);
      
      // Also call the original onSubmit callback to maintain existing functionality
      onSubmit(name.trim(), cleanPhone, functionDate);
    } else if (!validatePhone(cleanPhone)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
    }
  };

  return (
    <div className="flex gap-3 mb-4 justify-start">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-primary" />
      </div>
      <div className="max-w-[75%] md:max-w-[60%] px-4 py-3 rounded-lg bg-card text-card-foreground rounded-tl-none">
        <div className="mb-4">
          <p className="text-sm leading-relaxed mb-4">
            👋 Hi there! Welcome to Vivaha.<br/>
            Before we begin, could you tell me your name, phone number, and function date?
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting || state.submitting}
              className="text-sm"
            />
            <ValidationError 
              prefix="Name" 
              field="name"
              errors={state.errors}
              className="text-xs text-destructive"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter 10-digit mobile number (6-9XXXXXXX)"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
              required
              disabled={isSubmitting || state.submitting}
              className={`text-sm ${phoneError ? "border-destructive" : ""}`}
            />
            {phoneError && (
              <p className="text-xs text-destructive mt-1">{phoneError}</p>
            )}
            <ValidationError 
              prefix="Phone" 
              field="phone"
              errors={state.errors}
              className="text-xs text-destructive"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="functionDate" className="text-xs">Function Date</Label>
            <Input
              id="functionDate"
              name="functionDate"
              type="date"
              value={functionDate}
              onChange={(e) => setFunctionDate(e.target.value)}
              required
              disabled={isSubmitting || state.submitting}
              className="text-sm"
            />
            <ValidationError 
              prefix="Function Date" 
              field="functionDate"
              errors={state.errors}
              className="text-xs text-destructive"
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-3"
            disabled={!name.trim() || !phone.trim() || !functionDate || !!phoneError || isSubmitting || state.submitting}
          >
            {isSubmitting || state.submitting ? "Submitting..." : "Submit & Start Chat"}
          </Button>
        </form>
      </div>
    </div>
  );
}

