// client/src/hooks/use-auth.ts
import { useMutation } from "@tanstack/react-query";
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase";

interface LoginResponse {
  success: boolean;
  user?: { id: string; email: string | null };
  message?: string;
}

export function useGoogleSignIn() {
  return useMutation<LoginResponse, Error, void>({
    mutationFn: async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Save user info in Firestore (merge to avoid overwriting existing data)
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        return { success: true, user: { id: user.uid, email: user.email } };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
  });
}

export async function signOut() {
  await firebaseSignOut(auth);
}
