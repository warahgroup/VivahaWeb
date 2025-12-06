import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Download, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, ValidationError } from "@formspree/react";

interface ReportPaywallProps {
  notes: string[];
  reminders: string[];
  confirmed: string[];
}

function PremiumUpgradeForm({ 
  onSuccess, 
  onClose 
}: { 
  onSuccess: () => void; 
  onClose: () => void;
}) {
  const [state, handleSubmit] = useForm("myzrpora");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: "Premium Upgrade Request Submitted!",
        description: "Our team will contact you soon to complete your premium upgrade",
      });
      onSuccess();
      // Reset form fields after successful submission
      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        onClose();
      }, 2000);
    }
  }, [state.succeeded, toast, onSuccess, onClose]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="premium-name">Name *</Label>
        <Input
          id="premium-name"
          name="name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-11"
        />
        <ValidationError 
          prefix="Name" 
          field="name"
          errors={state.errors}
          className="text-xs text-destructive"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="premium-email">Email Address *</Label>
        <Input
          id="premium-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
        <ValidationError 
          prefix="Email" 
          field="email"
          errors={state.errors}
          className="text-xs text-destructive"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="premium-phone">Phone Number *</Label>
        <Input
          id="premium-phone"
          type="tel"
          name="phone"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="h-11"
        />
        <ValidationError 
          prefix="Phone" 
          field="phone"
          errors={state.errors}
          className="text-xs text-destructive"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-11"
        disabled={state.submitting}
      >
        {state.submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Premium Upgrade Request"
        )}
      </Button>
    </form>
  );
}

export function ReportPaywall({ notes, reminders, confirmed }: ReportPaywallProps) {
  const [isPaid, setIsPaid] = useState(() => {
    return localStorage.getItem("vivaha-premium") === "true";
  });
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (showUpgradeDialog) {
      setFormKey(prev => prev + 1);
      setIsSubmitted(false);
    }
  }, [showUpgradeDialog]);

  const handleUpgradeClick = () => {
    setShowUpgradeDialog(true);
  };

  const handleSuccess = () => {
    setIsSubmitted(true);
  };

  const handleCloseDialog = () => {
    setIsSubmitted(false);
    setShowUpgradeDialog(false);
  };

  const handleDownload = () => {
    const reportContent = `
VIVAHA WEDDING PLANNING REPORT
===============================

Notes (${notes.length}):
${notes.map((note, i) => `${i + 1}. ${note}`).join("\n")}

Reminders (${reminders.length}):
${reminders.map((reminder, i) => `${i + 1}. ${reminder}`).join("\n")}

Confirmed (${confirmed.length}):
${confirmed.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    toast({
      title: "Report Generated",
      description: `Your report contains ${notes.length + reminders.length + confirmed.length} items`,
    });

    alert("PDF Export (Mock):\n\n" + reportContent);
  };

  if (!isPaid) {
    return (
      <>
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Upgrade to Premium
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Level up your entire wedding-planning experience with powerful tools and personal support.
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-lg mb-6">Premium Features</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-card-foreground block">Real Personal Wedding Assistant</span>
                <span className="text-sm text-muted-foreground">A dedicated person who reminds you of every task and keeps your planning on track.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-card-foreground block">Shareable Planning Documents</span>
                <span className="text-sm text-muted-foreground">Coordinate smoothly with family and friends.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-card-foreground block">Printable Checklists</span>
                <span className="text-sm text-muted-foreground">Clear checklists for vendors, venues, and planning steps.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-card-foreground block">Priority Support</span>
                <span className="text-sm text-muted-foreground">Faster help from our wedding planning team.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-3 text-center">Special Offer</h3>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Premium Price: <span className="line-through">₹3,000</span> → <span className="text-primary font-semibold">Save ₹500!</span>
            </p>
            <p className="text-2xl font-bold text-foreground">
              Now only ₹2,500
            </p>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleUpgradeClick}
          data-testid="button-upgrade-premium"
          className="text-lg px-8"
        >
          Upgrade to Premium - ₹2,500
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Fill out the form to get started with Premium
        </p>
      </div>

      {/* Premium Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Please provide your details to proceed with the premium upgrade
            </DialogDescription>
          </DialogHeader>
          
          {!isSubmitted ? (
            <PremiumUpgradeForm key={formKey} onSuccess={handleSuccess} onClose={handleCloseDialog} />
          ) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground mb-6">
                Our team will contact you soon to complete your premium upgrade process.
              </p>
              <Button onClick={handleCloseDialog} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="bg-primary/10 rounded-2xl p-8 mb-8">
        <Check className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
          Premium Active
        </h2>
        <p className="text-lg text-muted-foreground">
          Your comprehensive wedding planning report is ready
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-lg mb-4">Report Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{notes.length}</p>
            <p className="text-sm text-muted-foreground">Notes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{reminders.length}</p>
            <p className="text-sm text-muted-foreground">Reminders</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{confirmed.length}</p>
            <p className="text-sm text-muted-foreground">Confirmed</p>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleDownload}
        data-testid="button-download-report"
        className="text-lg px-8"
      >
        <Download className="mr-2 h-5 w-5" />
        Download PDF Report
      </Button>
    </div>
  );
}
