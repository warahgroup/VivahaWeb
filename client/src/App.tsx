import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import LandingPage from "@/pages/landing";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  useAnalytics();
  const [, setLocation] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("vivaha-logged-in") === "true";
    const storedUserId = localStorage.getItem("vivaha-user-id") || "";
    setIsLoggedIn(loggedIn);
    setUserId(storedUserId);
    
    if (loggedIn && storedUserId) {
      setLocation("/chat");
    }
  }, [setLocation]);

  const handleLogin = (newUserId: string, email: string) => {
    setIsLoggedIn(true);
    setUserId(newUserId);
    setLocation("/chat");
  };

  const handleLogout = () => {
    localStorage.removeItem("vivaha-logged-in");
    localStorage.removeItem("vivaha-user-id");
    localStorage.removeItem("vivaha-user-email");
    setIsLoggedIn(false);
    setUserId("");
    setLocation("/");
  };

  return (
    <Switch>
      <Route path="/">
        {isLoggedIn && userId ? (
          <ChatPage onLogout={handleLogout} userId={userId} />
        ) : (
          <LandingPage onLogin={handleLogin} />
        )}
      </Route>
      <Route path="/chat">
        {isLoggedIn && userId ? (
          <ChatPage onLogout={handleLogout} userId={userId} />
        ) : (
          <LandingPage onLogin={handleLogin} />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
