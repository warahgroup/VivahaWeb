import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { addSampleMahals } from "@/utils/add-sample-mahals";
import { toast } from "@/hooks/use-toast";

/**
 * One-time setup page to add sample mahals to Firestore
 * This page can be accessed at /setup-sample-mahals
 * After running once, you can remove this route or keep it for testing
 */
export default function SetupSampleMahalsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    mahals?: Array<{ id: string; name: string }>;
  } | null>(null);

  const handleAddSampleMahals = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await addSampleMahals();
      setResult(response);

      if (response.success) {
        toast({
          title: "Sample Mahals Added",
          description: response.message,
        });
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setResult({
        success: false,
        message: errorMessage,
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-primary">
            Add Sample Mahals
          </CardTitle>
          <CardDescription>
            This will add 2 sample mock mahals to Firestore with placeholder images.
            Run this once to populate sample data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAddSampleMahals}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding Sample Mahals...
              </>
            ) : (
              "Add 2 Sample Mahals"
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
                  : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      result.success
                        ? "text-emerald-900 dark:text-emerald-100"
                        : "text-red-900 dark:text-red-100"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && result.mahals && (
                    <ul className="mt-2 space-y-1">
                      {result.mahals.map((mahal) => (
                        <li
                          key={mahal.id}
                          className="text-sm text-emerald-700 dark:text-emerald-300"
                        >
                          • {mahal.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Note: This will only add mahals if they don't already exist. Check the console for details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}






