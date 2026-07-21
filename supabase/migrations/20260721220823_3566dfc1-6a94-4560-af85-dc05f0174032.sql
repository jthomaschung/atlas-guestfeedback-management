GRANT SELECT, INSERT, UPDATE ON public.customer_outreach_log TO authenticated;
GRANT ALL ON public.customer_outreach_log TO service_role;

DROP POLICY IF EXISTS "Users can view outreach logs for accessible feedback" ON public.customer_outreach_log;

CREATE POLICY "Users can view outreach logs for accessible feedback"
ON public.customer_outreach_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customer_feedback cf
    WHERE cf.id = customer_outreach_log.feedback_id
      AND (
        public.is_admin(auth.uid())
        OR public.user_has_market_access_v2(auth.uid(), cf.market)
        OR public.user_has_store_access(auth.uid(), cf.store_number)
      )
  )
);