import { CheckCircle2, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VivahaPulsePanelProps {
  progressScore: number;
  confirmedCount: number;
}

export function VivahaPulsePanel({ progressScore, confirmedCount }: VivahaPulsePanelProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressScore / 100) * circumference;

  return (
    <div className="hidden lg:block w-80 border-l bg-card/50 backdrop-blur-sm p-6 overflow-y-auto">
      <div className="sticky top-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
            <TrendingUp className="h-5 w-5 text-primary relative z-10" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            Wedding Pulse
          </h3>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 mb-6 border border-primary/20">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted/30"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-foreground block">
                    {progressScore}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confirmed Items</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {confirmedCount}
              </span>
            </div>
            <Progress value={progressScore} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progressScore < 50
                ? "Keep going! Mark more items as confirmed to increase your readiness."
                : progressScore < 80
                ? "Great progress! You're well on your way to a perfect wedding."
                : "Excellent! Your wedding planning is almost complete."}
            </p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-xs text-muted-foreground text-center">
            Track your wedding planning progress in real-time. Each confirmed item increases your readiness score.
          </p>
        </div>
      </div>
    </div>
  );
}






