import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Church, Sparkles, Plane, IndianRupee, Users } from "lucide-react";
import type { QuizResponse } from "@shared/schema";

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: QuizResponse) => void;
}

export function QuizModal({ open, onOpenChange, onComplete }: QuizModalProps) {
  const [step, setStep] = useState(1);
  const [style, setStyle] = useState<QuizResponse["style"] | "">("");
  const [budget, setBudget] = useState<QuizResponse["budget"] | "">("");
  const [guestCount, setGuestCount] = useState<QuizResponse["guestCount"] | "">("");
  const { toast } = useToast();

  const handleNext = () => {
    if (step === 1 && !style) {
      toast({
        variant: "destructive",
        title: "Please select a style",
        description: "Choose your preferred wedding style to continue",
      });
      return;
    }
    if (step === 2 && !budget) {
      toast({
        variant: "destructive",
        title: "Please select a budget",
        description: "Choose your budget range to continue",
      });
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleSubmit = () => {
    if (!guestCount) {
      toast({
        variant: "destructive",
        title: "Please select guest count",
        description: "Choose your expected guest count to complete the quiz",
      });
      return;
    }
    
    const quizData: QuizResponse = {
      style: style as QuizResponse["style"],
      budget: budget as QuizResponse["budget"],
      guestCount: guestCount as QuizResponse["guestCount"],
    };
    
    localStorage.setItem("vivaha-quiz", JSON.stringify(quizData));
    toast({
      title: "Quiz completed!",
      description: "Your preferences will help us personalize your experience",
    });
    onComplete(quizData);
  };

  const styleOptions = [
    { value: "traditional", label: "Traditional", icon: Church, description: "Classic ceremonies with authentic rituals" },
    { value: "fusion", label: "Fusion", icon: Sparkles, description: "Modern twist on traditional celebrations" },
    { value: "destination", label: "Destination", icon: Plane, description: "Exotic locations for unique experiences" },
  ];

  const budgetOptions = [
    { value: "under15L", label: "Under ₹15 Lakhs", description: "Intimate and elegant celebrations" },
    { value: "15to25L", label: "₹15-25 Lakhs", description: "Balanced luxury and tradition" },
    { value: "over25L", label: "Over ₹25 Lakhs", description: "Grand and lavish affairs" },
  ];

  const guestOptions = [
    { value: "under100", label: "Under 100", description: "Intimate gatherings" },
    { value: "100to300", label: "100-300", description: "Medium-sized celebrations" },
    { value: "over300", label: "Over 300", description: "Grand celebrations" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Wedding Style Quiz</DialogTitle>
          <DialogDescription>
            Help us personalize your wedding planning experience ({step}/3)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What's your wedding style?</h3>
              <RadioGroup value={style} onValueChange={(v) => setStyle(v as QuizResponse["style"])}>
                {styleOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover-elevate transition-all cursor-pointer"
                    onClick={() => setStyle(option.value as QuizResponse["style"])}
                    data-testid={`radio-style-${option.value}`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <option.icon className="w-6 h-6 text-primary" />
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What's your budget range?</h3>
              <RadioGroup value={budget} onValueChange={(v) => setBudget(v as QuizResponse["budget"])}>
                {budgetOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover-elevate transition-all cursor-pointer"
                    onClick={() => setBudget(option.value as QuizResponse["budget"])}
                    data-testid={`radio-budget-${option.value}`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <IndianRupee className="w-6 h-6 text-primary" />
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Expected guest count?</h3>
              <RadioGroup value={guestCount} onValueChange={(v) => setGuestCount(v as QuizResponse["guestCount"])}>
                {guestOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover-elevate transition-all cursor-pointer"
                    onClick={() => setGuestCount(option.value as QuizResponse["guestCount"])}
                    data-testid={`radio-guests-${option.value}`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary" />
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              data-testid="button-quiz-back"
            >
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={handleNext} data-testid="button-quiz-next">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} data-testid="button-quiz-submit">
              Complete Quiz
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
