import { supabase } from "@/integrations/supabase/client";
import type { PortalKey } from "./portalKeys";

export type PortalAccessSuccess = { ok: true };
export type PortalAccessFailure = { ok: false; reason: "no_session" | "no_access" | "error" };
export type PortalAccessResult = PortalAccessSuccess | PortalAccessFailure;

export async function hasPortalAccess(
  portalKey: PortalKey,
  providedSession?: { user: { id: string } }
): Promise<PortalAccessResult> {
  try {
    // Use provided session if available (avoids race condition after setSession)
    // Otherwise get current session from SDK
    let userId: string;
    
    if (providedSession) {
      userId = providedSession.user.id;
    } else {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        return { ok: false, reason: "no_session" };
      }
      
      userId = sessionData.session.user.id;
    }

    // Look up portal ID from portals table where key = portalKey
    const { data: portal, error: portalError } = await supabase
      .from("portals")
      .select("id")
      .eq("key", portalKey)
      .single();

    if (portalError || !portal) {
      console.error("Portal lookup failed:", portalError);
      return { ok: false, reason: "error" };
    }

    // Check user_portal_access for matching portal_id AND user_id
    const { data: access, error: accessError } = await supabase
      .from("user_portal_access")
      .select("id")
      .eq("portal_id", portal.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (accessError) {
      console.error("Access check failed:", accessError);
      return { ok: false, reason: "error" };
    }

    if (!access) {
      return { ok: false, reason: "no_access" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Portal access check error:", error);
    return { ok: false, reason: "error" };
  }
}
