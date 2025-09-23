import { useState, useRef } from "react";
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
import { Bug, Lightbulb, MessageCircle, Upload, X, Image } from "lucide-react";

const feedbackSchema = z.object({
  category: z.enum(["Bug", "Feedback", "Wishlist"]),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  pageContext: z.string().optional(),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

// Define available pages
const pageOptions = [
  { value: "general", label: "General / Not page-specific" },
  { value: "/", label: "Dashboard / Home" },
  { value: "/summary", label: "Summary" },
  { value: "/facilities", label: "Facilities Dashboard" },
  { value: "/submit", label: "Submit Work Order" },
  { value: "/gfm", label: "Guest Feedback Management" },
  { value: "/feedback-reporting", label: "Feedback Reporting" },
  { value: "/red-carpet-leaders", label: "Red Carpet Leaders" },
  { value: "/feedback-archive", label: "Feedback Archive" },
  { value: "/user-hierarchy", label: "User Hierarchy" },
  { value: "/settings", label: "Settings" },
];

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "Feedback",
      title: "",
      description: "",
      pageContext: window.location.pathname === "/" ? "/" : window.location.pathname,
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

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      // Upload screenshot if provided
      let screenshotPath = null;
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('feedback-screenshots')
          .upload(filePath, screenshot);

        if (uploadError) {
          console.error("Screenshot upload error:", uploadError);
          toast({
            title: "Upload failed",
            description: "Failed to upload screenshot. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        screenshotPath = filePath;
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
        page_context: data.pageContext || "general",
        screenshot_path: screenshotPath,
        browser_info: browserInfo,
      });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      });

      form.reset();
      removeScreenshot();
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              name="pageContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page / Context</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the page this feedback relates to" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pageOptions.map((page) => (
                        <SelectItem key={page.value} value={page.value}>
                          {page.label}
                        </SelectItem>
                      ))}
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

            {/* Screenshot Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Screenshot (Optional)</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {screenshotPreview ? (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      <img 
                        src={screenshotPreview} 
                        alt="Screenshot preview" 
                        className="max-w-full max-h-48 object-contain rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeScreenshot}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {screenshot?.name} ({((screenshot?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Add a screenshot to help explain the issue
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supports PNG, JPG, GIF, WEBP. Max size: 5MB
              </p>
            </div>

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