import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bug, Lightbulb, MessageCircle } from "lucide-react";

const feedbackSchema = z.object({
  category: z.enum(["Bug", "Feedback", "Wishlist"]),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "Feedback",
      title: "",
      description: "",
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Bug":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "Wishlist":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "Bug":
        return "Report a bug or technical issue";
      case "Wishlist":
        return "Suggest a new feature or improvement";
      default:
        return "Share general feedback or thoughts";
    }
  };

  const onSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit feedback",
          variant: "destructive",
        });
        return;
      }

      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      const { error } = await supabase.from("internal_feedback").insert({
        user_id: user.id,
        category: data.category,
        title: data.title,
        description: data.description,
        page_url: window.location.href,
        browser_info: browserInfo,
      });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Help us improve the platform by sharing bugs, feedback, or feature requests.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bug">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4 text-red-500" />
                          <div>
                            <div className="font-medium">Bug Report</div>
                            <div className="text-xs text-muted-foreground">
                              Report a bug or technical issue
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="Feedback">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">Feedback</div>
                            <div className="text-xs text-muted-foreground">
                              Share general feedback or thoughts
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="Wishlist">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <div>
                            <div className="font-medium">Feature Request</div>
                            <div className="text-xs text-muted-foreground">
                              Suggest a new feature or improvement
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief summary of your feedback" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about your feedback, bug report, or feature request. Include steps to reproduce for bugs."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}