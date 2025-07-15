-- Add notes column to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN notes TEXT[];

-- Create index for better performance on notes queries
CREATE INDEX idx_work_orders_notes ON public.work_orders USING GIN(notes);

-- Add comment to document the notes field
COMMENT ON COLUMN public.work_orders.notes IS 'Array of notes/comments added to the work order for tracking progress and communication';