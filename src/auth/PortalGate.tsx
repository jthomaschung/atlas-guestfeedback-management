import { useEffect, useState } from "react";
import { hasPortalAccess, type PortalAccessResult } from "./hasPortalAccess";
import type { PortalKey } from "./portalKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Home, Loader2, ShieldX } from "lucide-react";

interface PortalGateProps {
  portalKey: PortalKey;
  masterLoginUrl: string;
  masterHomeUrl: string;
  children: React.ReactNode;
}

export function PortalGate({
  portalKey,
  masterLoginUrl,
  masterHomeUrl,
  children,
}: PortalGateProps) {
  const [accessResult, setAccessResult] = useState<PortalAccessResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      setIsChecking(true);
      const result = await hasPortalAccess(portalKey);
      if (mounted) {
        setAccessResult(result);
        setIsChecking(false);
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [portalKey]);

  // Loading state
  if (isChecking || accessResult === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  // Access granted
  if (accessResult.ok === true) {
    return <>{children}</>;
  }

  // TypeScript now knows accessResult is PortalAccessFailure
  // No session - Login required
  if (accessResult.reason === "no_session") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please sign in to access the Guest Feedback portal.
            </p>
            <Button asChild className="w-full">
              <a href={masterLoginUrl}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No access or error
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You don't have access to the Guest Feedback portal. Please contact your administrator if you believe this is an error.
          </p>
          <Button asChild variant="outline" className="w-full">
            <a href={masterHomeUrl}>
              <Home className="h-4 w-4 mr-2" />
              Return to Portal Selection
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
