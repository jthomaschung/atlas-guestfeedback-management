import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const P1_2026_START = '2025-12-31';

interface Period {
  name: string;
  start_date: string;
  end_date: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting period backfill for feedback >= 2025-12-31...');

    // Step 1: Get all periods for 2026+
    const { data: periods, error: periodsError } = await supabase
      .from('periods')
      .select('name, start_date, end_date')
      .gte('year', 2026)
      .order('start_date', { ascending: true });

    if (periodsError) {
      console.error('Error fetching periods:', periodsError);
      throw new Error(`Failed to fetch periods: ${periodsError.message}`);
    }

    console.log(`Found ${periods?.length || 0} periods for 2026+`);

    // Step 2: Get all feedback needing period assignment
    const { data: feedbackToUpdate, error: feedbackError } = await supabase
      .from('customer_feedback')
      .select('id, feedback_date')
      .gte('feedback_date', P1_2026_START)
      .or('period.is.null,period.eq.');

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw new Error(`Failed to fetch feedback: ${feedbackError.message}`);
    }

    console.log(`Found ${feedbackToUpdate?.length || 0} feedback records needing period assignment`);

    if (!feedbackToUpdate || feedbackToUpdate.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No feedback records need period assignment',
          updated: 0,
          periodSummary: {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Find matching period for each feedback record
    const findPeriodForDate = (feedbackDate: string): string | null => {
      if (!periods) return null;
      
      for (const period of periods) {
        if (feedbackDate >= period.start_date && feedbackDate <= period.end_date) {
          return period.name;
        }
      }
      return null;
    };

    // Step 4: Update each record
    const periodSummary: Record<string, number> = {};
    let updatedCount = 0;
    let errorCount = 0;

    for (const feedback of feedbackToUpdate) {
      const periodName = findPeriodForDate(feedback.feedback_date);
      
      if (periodName) {
        const { error: updateError } = await supabase
          .from('customer_feedback')
          .update({ period: periodName })
          .eq('id', feedback.id);

        if (updateError) {
          console.error(`Error updating feedback ${feedback.id}:`, updateError);
          errorCount++;
        } else {
          updatedCount++;
          periodSummary[periodName] = (periodSummary[periodName] || 0) + 1;
        }
      } else {
        console.warn(`No matching period found for feedback ${feedback.id} with date ${feedback.feedback_date}`);
      }
    }

    console.log(`Backfill complete: ${updatedCount} updated, ${errorCount} errors`);
    console.log('Period summary:', periodSummary);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Backfill complete`,
        updated: updatedCount,
        errors: errorCount,
        periodSummary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Backfill error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
