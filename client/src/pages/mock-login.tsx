import { MockLogin } from "@/components/mock-login";

interface MockLoginPageProps {
  onLogin: (userId: string, email: string) => void;
}

export default function MockLoginPage({ onLogin }: MockLoginPageProps) {
  return <MockLogin onSuccess={onLogin} />;
}

