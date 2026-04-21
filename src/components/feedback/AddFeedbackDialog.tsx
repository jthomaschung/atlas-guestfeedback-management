import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const COMPLAINT_CATEGORIES = [
  "Bread Quality",
  "Cleanliness",
  "Closed Early",
  "Credit Card Issue",
  "Loyalty Program Issues",
  "Missing Item",
  "Order Accuracy",
  "Other",
  "Out of Product",
  "Possible Food Poisoning",
  "Praise",
  "Product Issue",
  "Rude Service",
  "Sandwich Made Wrong",
  "Slow Service",
  "Unauthorized Tip",
];

const PRIORITIES = ["Praise", "Low", "Medium", "High", "Critical"] as const;
const TYPES_OF_FEEDBACK = ["Guest Support", "FYI"] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StoreInfo {
  store_number: string;
  region: string | null;
}

interface AddFeedbackDialogProps {
  onFeedbackAdded: () => void;
}

export function AddFeedbackDialog({ onFeedbackAdded }: AddFeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const { toast } = useToast();
  const authContext = useAuth();
  const user = authContext?.user;

  const [form, setForm] = useState({
    feedback_date: new Date().toISOString().split("T")[0],
    store_number: "",
    market: "",
    complaint_category: "",
    feedback_text: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    priority: "Low",
    type_of_feedback: "Guest Support",
    ee_action: "",
    order_number: "",
    reward: "",
  });

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase
        .from("stores")
        .select("store_number, region")
        .neq("store_number", "Corp")
        .order("store_number");
      if (data) {
        setStores(data.map(s => ({ store_number: s.store_number, region: s.region })));
      }
    };
    fetchStores();
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStoreChange = (storeNumber: string) => {
    const store = stores.find((s) => s.store_number === storeNumber);
    setForm((prev) => ({
      ...prev,
      store_number: storeNumber,
      market: store?.region || "",
    }));
  };

  const resetForm = () => {
    setForm({
      feedback_date: new Date().toISOString().split("T")[0],
      store_number: "",
      market: "",
      complaint_category: "",
      feedback_text: "",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      priority: "Low",
      type_of_feedback: "Guest Support",
      ee_action: "",
      order_number: "",
      reward: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = form.customer_email.trim();
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid customer email address or leave it blank.",
      });
      return;
    }

    const selectedStore = stores.find((s) => s.store_number === form.store_number);
    const resolvedMarket = form.market || selectedStore?.region || "";

    if (!form.store_number || !resolvedMarket || !form.complaint_category) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Store, market, and category are required.",
      });
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const authenticatedUser = authData.user;

    if (authError || !authenticatedUser?.id) {
      toast({
        variant: "destructive",
        title: "Session expired",
        description: "Please refresh and sign in again before adding feedback.",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Optional period lookup — don't block insert if it fails
      let period: string | null = null;
      try {
        const { data: periodData } = await supabase
          .from("periods")
          .select("name")
          .lte("start_date", form.feedback_date)
          .gte("end_date", form.feedback_date)
          .maybeSingle();
        if (periodData?.name) {
          period = periodData.name;
        }
      } catch {
        console.warn("Period lookup failed, continuing without period");
      }

      const caseNumber = `CF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const normalizedType = (form.type_of_feedback || "Guest Support").toLowerCase().trim();

      const { error } = await supabase.from("customer_feedback").insert({
        feedback_date: form.feedback_date,
        store_number: form.store_number,
        market: resolvedMarket,
        complaint_category: form.complaint_category,
        feedback_text: form.feedback_text || null,
        customer_name: form.customer_name || null,
        customer_email: trimmedEmail || null,
        customer_phone: form.customer_phone || null,
        priority: form.priority,
        type_of_feedback: form.type_of_feedback || null,
        ee_action: form.ee_action || null,
        order_number: form.order_number || null,
        reward: form.reward || null,
        channel: "RAP",
        feedback_source: "Manual Entry",
        case_number: caseNumber,
        resolution_status: "unopened",
        assignee: "guestfeedback@atlaswe.com",
        user_id: authenticatedUser.id,
        period,
      });

      if (error) {
        console.error("Insert error:", error);
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: `Failed to add feedback: ${error.message}`,
        });
        return;
      }

      toast({ title: "Success", description: "Feedback added successfully." });
      resetForm();
      setOpen(false);
      onFeedbackAdded();
    } catch (err) {
      console.error("Submit error:", err);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "An unexpected error occurred while saving feedback.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manually Add Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          {/* Row 1: Date + Store + Market */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="feedback_date">Date *</Label>
              <Input
                id="feedback_date"
                type="date"
                value={form.feedback_date}
                onChange={(e) => updateField("feedback_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Store # *</Label>
              <Select value={form.store_number} onValueChange={handleStoreChange}>
                <SelectTrigger><SelectValue placeholder="Select store..." /></SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.store_number} value={s.store_number}>
                      {s.store_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="market">Market *</Label>
              <Input
                id="market"
                value={form.market}
                readOnly
                className="bg-muted"
                placeholder="Auto-set from store"
              />
            </div>
          </div>

          {/* Row 2: Category + Priority + Type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.complaint_category} onValueChange={(v) => updateField("complaint_category", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => updateField("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type_of_feedback} onValueChange={(v) => updateField("type_of_feedback", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES_OF_FEEDBACK.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Customer info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                placeholder="Name"
                value={form.customer_name}
                onChange={(e) => updateField("customer_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                placeholder="email@example.com"
                value={form.customer_email}
                onChange={(e) => updateField("customer_email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                placeholder="555-123-4567"
                value={form.customer_phone}
                onChange={(e) => updateField("customer_phone", e.target.value)}
              />
            </div>
          </div>

          {/* Feedback text */}
          <div className="space-y-1.5">
            <Label htmlFor="feedback_text">Feedback Text</Label>
            <Textarea
              id="feedback_text"
              placeholder="Enter customer feedback..."
              value={form.feedback_text}
              onChange={(e) => updateField("feedback_text", e.target.value)}
              rows={4}
            />
          </div>

          {/* Row 4: Action + Order # + Reward */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ee_action">Action Item</Label>
              <Input
                id="ee_action"
                placeholder="e.g. GFM to follow up"
                value={form.ee_action}
                onChange={(e) => updateField("ee_action", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order_number">Order #</Label>
              <Input
                id="order_number"
                placeholder="Order number"
                value={form.order_number}
                onChange={(e) => updateField("order_number", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reward">Reward</Label>
              <Input
                id="reward"
                placeholder="e.g. $10 credit"
                value={form.reward}
                onChange={(e) => updateField("reward", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
