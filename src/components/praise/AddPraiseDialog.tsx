import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const praiseSchema = z.object({
  store_number: z.string().min(1, "Store number is required"),
  market: z.string().min(1, "Market is required"),
  feedback_text: z.string().min(10, "Praise must be at least 10 characters"),
  customer_name: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback_date: z.date().optional(),
});

type PraiseFormValues = z.infer<typeof praiseSchema>;

interface AddPraiseDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  markets: string[];
}

export function AddPraiseDialog({ open, onClose, onSuccess, markets }: AddPraiseDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);

  const form = useForm<PraiseFormValues>({
    resolver: zodResolver(praiseSchema),
    defaultValues: {
      store_number: "",
      market: "",
      feedback_text: "",
      customer_name: "",
      feedback_date: new Date(),
    },
  });

  const generateCaseNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PRAISE-${timestamp}-${random}`;
  };

  const onSubmit = async (data: PraiseFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add praise");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("customer_feedback").insert({
        case_number: generateCaseNumber(),
        store_number: data.store_number,
        market: data.market,
        feedback_text: data.feedback_text,
        customer_name: data.customer_name || null,
        rating: data.rating || null,
        feedback_date: format(data.feedback_date || new Date(), "yyyy-MM-dd"),
        channel: "Manual Entry",
        complaint_category: "Praise",
        priority: "Praise",
        resolution_status: "resolved",
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Praise added successfully! 🌟");
      form.reset();
      setSelectedRating(undefined);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding praise:", error);
      toast.error("Failed to add praise. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <Star className="h-5 w-5 fill-amber-400" />
            Add New Praise
          </DialogTitle>
          <DialogDescription>
            Manually add praise that wasn't captured automatically. This will appear across all dashboards.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="store_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select market" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {markets.map((market) => (
                          <SelectItem key={market} value={market}>
                            {market}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Praise Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the praise or positive feedback..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={() => (
                  <FormItem>
                    <FormLabel>Rating (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={cn(
                                "h-6 w-6 transition-colors",
                                selectedRating && star <= selectedRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground hover:text-amber-300"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedback_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isSubmitting ? "Adding..." : "Add Praise"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
