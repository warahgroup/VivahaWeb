import { CheckCircle2 } from "lucide-react";

interface ProgressTrackerProps {
  score: number;
  confirmedCount: number;
  confirmedItems: string[];
}

export function ProgressTracker({ score, confirmedItems = [] }: ProgressTrackerProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 sticky top-24">
      <h3 className="font-semibold text-lg text-foreground mb-4">
        Wedding Readiness
      </h3>
      
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted"
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
            <span className="text-2xl font-bold text-foreground">
              {score}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Recent Confirmations
        </h4>
        {confirmedItems.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No confirmed items yet. Start marking tasks as confirmed to increase your score!
          </p>
        ) : (
          <ul className="space-y-2">
            {confirmedItems.slice(0, 5).map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-card-foreground"
                data-testid={`progress-item-${index}`}
              >
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
