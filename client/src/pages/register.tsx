import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (currentUser?.emailVerified) {
    setLocation("/");
    return null;
  }

  if (currentUser && !currentUser.emailVerified) {
    setLocation("/verify-email");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        displayName,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(user);

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      setLocation("/verify-email");
    } catch (error: any) {
      console.error("Registration error:", error);
      let message = "Failed to create account";
      if (error.code === "auth/email-already-in-use") {
        message = "This email is already registered";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address";
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join StudySync to collaborate on tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isLoading}
                data-testid="input-display-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                disabled={isLoading}
                data-testid="input-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                disabled={isLoading}
                data-testid="input-confirm-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
