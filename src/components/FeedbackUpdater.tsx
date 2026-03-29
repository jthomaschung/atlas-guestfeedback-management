import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateFeedbackAssigneeOnce } from '@/utils/updateFeedbackAssignee';

export function FeedbackUpdater() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      updateFeedbackAssigneeOnce().then((result) => {
        console.log('Update result:', result);
      });
    }
  }, [user?.id]);

  return null;
}