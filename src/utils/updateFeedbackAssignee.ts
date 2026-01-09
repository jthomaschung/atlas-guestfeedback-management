import { supabase } from "@/integrations/supabase/client";

export async function updateFeedbackAssigneeOnce() {
  const flagKey = 'fix-ne1-rude-service-0ca71137';
  try {
    if (localStorage.getItem(flagKey) === 'done') {
      console.log('Update already applied, skipping.');
      return { success: true, skipped: true } as const;
    }

    // Ensure we have an authenticated session so the edge function passes JWT verification
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('No session yet; will retry after auth state change.');
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          // Unsubscribe immediately after first session
          listener.subscription.unsubscribe();
          await updateFeedbackAssigneeOnce();
        }
      });
      return { success: false, waitingForSession: true } as const;
    }

    const { data, error } = await supabase.functions.invoke('update-feedback-assignee', {
      body: {
        feedbackId: '0ca71137-60c4-41ef-bbb6-8e56f884cfad',
        assignee: 'sarah.wetzel@atlaswe.com'
      }
    });

    if (error) {
      console.error('Error updating feedback:', error);
      return { success: false, error } as const;
    }

    localStorage.setItem(flagKey, 'done');
    console.log('Successfully updated feedback:', data);
    return { success: true, data } as const;
  } catch (error: any) {
    console.error('Function call error:', error);
    return { success: false, error } as const;
  }
}

// Note: This function is called by FeedbackUpdater component when user is authenticated
// Do NOT self-invoke here as it causes race conditions with session initialization