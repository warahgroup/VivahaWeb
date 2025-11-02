import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { signOut } from "./hooks/use-auth";
import LandingPage from "@/pages/landing";
import ChatPage from "@/pages/chat";
import MockLoginPage from "@/pages/mock-login";
import NotFound from "@/pages/not-found";

function Router() {
  useAnalytics();
  const [, setLocation] = useLocation();
  
  // Initialize state from localStorage immediately to avoid redirect issues
  const getInitialLoginState = () => {
    if (typeof window === "undefined") return { isLoggedIn: false, userId: "" };
    const loggedIn = localStorage.getItem("vivaha-logged-in") === "true";
    const storedUserId = localStorage.getItem("vivaha-user-id") || "";
    return { isLoggedIn: loggedIn, userId: storedUserId };
  };
  
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoginState().isLoggedIn);
  const [userId, setUserId] = useState<string>(getInitialLoginState().userId);

  useEffect(() => {
    const { isLoggedIn: loggedIn, userId: storedUserId } = getInitialLoginState();
    setIsLoggedIn(loggedIn);
    setUserId(storedUserId);
    
    // Only auto-redirect to chat if user navigates directly to /chat
    // Don't force redirect on home page
  }, [setLocation]);

  const handleLogin = (newUserId: string, email: string) => {
    setIsLoggedIn(true);
    setUserId(newUserId);
    setLocation("/chat");
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
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
        <LandingPage onLogin={handleLogin} />
      </Route>
      <Route path="/chat">
        {isLoggedIn && userId ? (
          <ChatPage onLogout={handleLogout} userId={userId} />
        ) : (
          <LandingPage onLogin={handleLogin} />
        )}
      </Route>
      <Route path="/mock-login">
        <MockLoginPage onLogin={handleLogin} />
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
