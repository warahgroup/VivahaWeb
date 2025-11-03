import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";

interface ConsultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ConsultationForm({ 
  onSuccess, 
  onClose 
}: { 
  onSuccess: () => void; 
  onClose: () => void;
}) {
  const [state, handleSubmit] = useForm("mkgpaqzz");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: "Consultation booked!",
        description: "Our team will contact you within 24 hours",
      });
      onSuccess();
      // Reset form fields after successful submission
      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        onClose();
      }, 2000);
    }
  }, [state.succeeded, toast, onSuccess, onClose]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="input-consult-name"
          required
        />
        <ValidationError 
          prefix="Name" 
          field="name"
          errors={state.errors}
          className="text-xs text-destructive"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="consult-email">Email *</Label>
        <Input
          id="consult-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-consult-email"
          required
        />
        <ValidationError 
          prefix="Email" 
          field="email"
          errors={state.errors}
          className="text-xs text-destructive"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          name="phone"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          data-testid="input-consult-phone"
          required
        />
        <ValidationError 
          prefix="Phone" 
          field="phone"
          errors={state.errors}
          className="text-xs text-destructive"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your wedding plans..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          data-testid="textarea-consult-message"
          rows={3}
        />
        <ValidationError 
          prefix="Message" 
          field="message"
          errors={state.errors}
          className="text-xs text-destructive"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={state.submitting}
        data-testid="button-consult-submit"
      >
        {state.submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : (
          "Book Consultation"
        )}
      </Button>
    </form>
  );
}

export function ConsultModal({ open, onOpenChange }: ConsultModalProps) {
  const [formKey, setFormKey] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormKey(prev => prev + 1);
      setIsSubmitted(false);
    }
  }, [open]);

  const handleSuccess = () => {
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Book Free Consultation
          </DialogTitle>
          <DialogDescription>
            Schedule a call with our expert wedding planners
          </DialogDescription>
        </DialogHeader>
        
        {!isSubmitted ? (
          <ConsultationForm key={formKey} onSuccess={handleSuccess} onClose={handleClose} />
        ) : (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Set!</h3>
            <p className="text-muted-foreground mb-6">
              We'll reach out to you within 24 hours to schedule your free consultation
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
