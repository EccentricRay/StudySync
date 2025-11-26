import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
    } else if (currentUser.emailVerified) {
      setLocation("/");
    }
  }, [currentUser, setLocation]);

  const handleResendEmail = async () => {
    if (!currentUser) return;

    setIsSending(true);
    try {
      await sendEmailVerification(currentUser);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!currentUser) return;

    setIsChecking(true);
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        toast({
          title: "Email verified!",
          description: "Redirecting to dashboard...",
        });
        setLocation("/");
      } else {
        toast({
          title: "Email not verified yet",
          description: "Please check your email and click the verification link",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error checking verification",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{currentUser.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground">
            <p className="mb-2">To continue using StudySync, please:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Check your email inbox</li>
              <li>Click the verification link we sent you</li>
              <li>Return here and click "Check Verification"</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleCheckVerification}
              disabled={isChecking}
              data-testid="button-check-verification"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking..." : "Check Verification"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isSending}
              data-testid="button-resend-email"
            >
              {isSending ? "Sending..." : "Resend Verification Email"}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
