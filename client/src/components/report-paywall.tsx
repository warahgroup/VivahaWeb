import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportPaywallProps {
  notes: string[];
  reminders: string[];
  confirmed: string[];
}

export function ReportPaywall({ notes, reminders, confirmed }: ReportPaywallProps) {
  const [isPaid, setIsPaid] = useState(() => {
    return localStorage.getItem("vivaha-premium") === "true";
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = () => {
    setIsProcessing(true);
    
    // Simulate Stripe checkout
    setTimeout(() => {
      localStorage.setItem("vivaha-premium", "true");
      setIsPaid(true);
      setIsProcessing(false);
      toast({
        title: "Welcome to Premium!",
        description: "Your report is now available for download",
      });
    }, 1500);
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
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Upgrade to Premium
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get detailed PDF reports of all your wedding planning progress
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-lg mb-4">Premium Features Include:</h3>
          <ul className="space-y-3">
            {[
              "Comprehensive PDF reports with all your notes, reminders, and confirmed items",
              "Shareable planning documents for coordination with family",
              "Printable checklists for vendors and venues",
              "Priority support from our wedding planning team",
            ].map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-card-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          size="lg"
          onClick={handleUpgrade}
          disabled={isProcessing}
          data-testid="button-upgrade-premium"
          className="text-lg px-8"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Upgrade to Premium - ₹999/year"
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Secure payment powered by Stripe
        </p>
      </div>
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
