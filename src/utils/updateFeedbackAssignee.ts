import { supabase } from "@/integrations/supabase/client";

export async function updateFeedbackAssignee() {
  try {
    const { data, error } = await supabase.functions.invoke('update-feedback-assignee', {
      body: {
        feedbackId: '0ca71137-60c4-41ef-bbb6-8e56f884cfad',
        assignee: 'sarah.wetzel@atlaswe.com'
      }
    });

    if (error) {
      console.error('Error updating feedback:', error);
      return { success: false, error };
    }

    console.log('Successfully updated feedback:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Function call error:', error);
    return { success: false, error };
  }
}

// Call the function immediately
updateFeedbackAssignee().then(result => {
  console.log('Update result:', result);
});