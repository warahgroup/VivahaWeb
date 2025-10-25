import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userId: string, email: string) => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both email and password",
      });
      return;
    }

    loginMutation.mutate(
      { email, password, rememberMe },
      {
        onSuccess: (response) => {
          if (response.success && response.user) {
            localStorage.setItem("vivaha-user-id", response.user.id);
            localStorage.setItem("vivaha-user-email", response.user.email);
            localStorage.setItem("vivaha-logged-in", "true");
            
            if (rememberMe) {
              const expiry = new Date();
              expiry.setDate(expiry.getDate() + 7);
              localStorage.setItem("vivaha-remember-expiry", expiry.toISOString());
            }
            
            toast({
              title: "Welcome to Vivaha!",
              description: "You're now logged in. Let's plan your dream wedding.",
            });
            
            trackEvent("login", "auth", "success");
            onSuccess(response.user.id, response.user.email);
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: response.message || "Invalid credentials",
            });
          }
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Login error",
            description: error.message || "Failed to login. Please try again.",
          });
          trackEvent("login", "auth", "error");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Get Started</DialogTitle>
          <DialogDescription>
            Sign in to access your personalized wedding planning dashboard
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-password"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              data-testid="checkbox-remember-me"
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me for 7 days
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
            data-testid="button-submit-login"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-4">
          New to Vivaha? Creating an account automatically with your first sign-in
        </p>
      </DialogContent>
    </Dialog>
  );
}
