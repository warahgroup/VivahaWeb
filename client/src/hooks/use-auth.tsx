import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LoginRequest, AuthResponse } from "@shared/schema";

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      return apiRequest("POST", "/api/auth/login", credentials);
    },
  });
}
