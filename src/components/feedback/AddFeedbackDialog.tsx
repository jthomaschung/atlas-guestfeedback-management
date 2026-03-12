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
  "Sandwich Made Wrong",
  "Missing Item",
  "Slow Service",
  "Rude Service",
  "Cleanliness",
  "Out of Product",
  "Closed Early",
  "Bread Quality",
  "Credit Card Issue",
  "Possible Food Poisoning",
  "Loyalty Program Issues",
  "Unauthorized Tip",
  "Product Issue",
  "Praise",
  "Other",
];

const PRIORITIES = ["Praise", "Low", "Medium", "High", "Critical"] as const;
const TYPES_OF_FEEDBACK = ["Guest Support", "FYI"] as const;

const normalizeText = (value: string) => value.toLowerCase().trim().replace(/\s+/g, " ");

const STORE_FOLLOW_UP_CATEGORIES = new Set([
  "sandwich made wrong",
  "missing item",
  "missing items",
  "sandwich issue",
  "order issue",
  "order accuracy",
  "cleanliness",
  "closed early",
]);

const AUTO_ESCALATE_CATEGORIES = new Set([
  "out of product",
  "rude service",
  "possible food poisoning",
  "oop",
]);

async function findDmEmailForMarket(market: string): Promise<string | null> {
  try {
    const normalizedMarket = market.replace(/\s+/g, "").toUpperCase();

    const { data: permissionRows, error: permissionError } = await supabase
      .from("user_permissions")
      .select("user_id, markets")
      .not("markets", "is", null);

    if (permissionError || !permissionRows?.length) return null;

    const matchingUserIds = permissionRows
      .filter((row) =>
        Array.isArray(row.markets) &&
        row.markets.some(
          (value) =>
            typeof value === "string" &&
            value.replace(/\s+/g, "").toUpperCase() === normalizedMarket
        )
      )
      .map((row) => row.user_id)
      .filter((userId): userId is string => typeof userId === "string");

    if (!matchingUserIds.length) return null;

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .in("user_id", matchingUserIds)
      .not("email", "is", null)
      .limit(1);

    if (profileError || !profiles?.length) return null;

    return profiles[0].email;
  } catch (error) {
    console.error("Error finding DM assignee:", error);
    return null;
  }
}

async function resolveInitialAssignee({
  complaintCategory,
  storeNumber,
  market,
  typeOfFeedback,
}: {
  complaintCategory: string;
  storeNumber: string;
  market: string;
  typeOfFeedback: string;
}): Promise<string> {
  const normalizedType = normalizeText(typeOfFeedback || "Guest Support");
  const normalizedCategory = normalizeText(complaintCategory);

  if (normalizedType === "fyi") {
    return "guestfeedback@atlaswe.com";
  }

  if (normalizedType !== "guest support") {
    return "guestfeedback@atlaswe.com";
  }

  if (STORE_FOLLOW_UP_CATEGORIES.has(normalizedCategory)) {
    return `store${storeNumber}@atlaswe.com`;
  }

  if (AUTO_ESCALATE_CATEGORIES.has(normalizedCategory)) {
    return (await findDmEmailForMarket(market)) || "guestfeedback@atlaswe.com";
  }

  return "guestfeedback@atlaswe.com";
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

    if (!form.store_number || !form.market || !form.complaint_category) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Store, market, and category are required.",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to add feedback.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Look up period
      let period: string | null = null;
      const { data: periodData } = await supabase
        .from("periods")
        .select("name")
        .lte("start_date", form.feedback_date)
        .gte("end_date", form.feedback_date)
        .maybeSingle();
      if (periodData?.name) {
        period = periodData.name;
      }

      const caseNumber = `CF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const assignee = await resolveInitialAssignee({
        complaintCategory: form.complaint_category,
        storeNumber: form.store_number,
        market: form.market,
        typeOfFeedback: form.type_of_feedback,
      });

      const { error } = await supabase.from("customer_feedback").insert({
        feedback_date: form.feedback_date,
        store_number: form.store_number,
        market: form.market,
        complaint_category: form.complaint_category,
        feedback_text: form.feedback_text || null,
        customer_name: form.customer_name || null,
        customer_email: form.customer_email || null,
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
        assignee,
        user_id: user.id,
        period,
      });

      if (error) {
        console.error("Insert error:", error);
        toast({
          variant: "destructive",
          title: "Error",
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
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
