import { useEffect, useState } from "react";
import { hasPortalAccess, type PortalAccessResult } from "./hasPortalAccess";
import type { PortalKey } from "./portalKeys";
import {
  hasAuthTokensInUrl,
  extractTokensFromUrl,
  authenticateWithTokens,
  cleanUrlFromTokens,
} from "@/utils/sessionToken";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Loader2, ShieldX } from "lucide-react";

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

      // Step 1: Check for incoming tokens from master portal and process them first
      if (hasAuthTokensInUrl()) {
        console.log("PortalGate: Found auth tokens in URL, processing...");
        const tokens = extractTokensFromUrl();
        if (tokens) {
          const authenticated = await authenticateWithTokens(tokens);
          if (authenticated) {
            console.log("PortalGate: Successfully authenticated with tokens");
            cleanUrlFromTokens();
          } else {
            console.warn("PortalGate: Failed to authenticate with tokens");
          }
        }
      }

      // Step 2: Now check portal access (session should be established if tokens were valid)
      const result = await hasPortalAccess(portalKey);
      
      if (mounted) {
        // Step 3: If no session and no tokens in URL, auto-redirect to master login
        if (result.ok === false && result.reason === "no_session") {
          console.log("PortalGate: No session found, redirecting to master portal login");
          // Add return URL so user can come back after login
          const returnUrl = encodeURIComponent(window.location.href);
          window.location.href = `${masterLoginUrl}?returnUrl=${returnUrl}`;
          return;
        }

        setAccessResult(result);
        setIsChecking(false);
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [portalKey, masterLoginUrl]);

  // Loading state (including while redirecting)
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

  // No access (user is logged in but doesn't have portal access)
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
