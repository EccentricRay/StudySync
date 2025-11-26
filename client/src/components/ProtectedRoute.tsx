import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  if (!currentUser.emailVerified) {
    return <Redirect to="/verify-email" />;
  }

  return <>{children}</>;
}
