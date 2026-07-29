import { CustomerFeedback } from "@/types/feedback";

// Market (district) -> Region mapping
export const marketToRegion: Record<string, string> = {
  "AZ 1": "West Coast",
  "AZ 2": "West Coast",
  "AZ 3": "West Coast",
  "AZ 4": "West Coast",
  "AZ 5": "West Coast",
  "IE/LA": "West Coast",
  "OC": "West Coast",
  "NE 1": "Mid West",
  "NE 2": "Mid West",
  "NE 3": "Mid West",
  "NE 4": "Mid West",
  "FL 1": "East Region",
  "FL 2": "East Region",
  "MN 1": "East Region",
  "MN 2": "East Region",
  "PA 1": "East Region",
};

export const getRegion = (market?: string | null): string =>
  marketToRegion[(market || "").trim()] || "Other";

export const getDistrict = (market?: string | null): string =>
  (market || "").trim() || "Unknown";

export type AccuracyCategory = "missing" | "sandwich" | "accuracy";

export const classifyAccuracy = (fb: CustomerFeedback): AccuracyCategory | null => {
  const category = fb.complaint_category?.toLowerCase() ?? "";
  const type = fb.type_of_feedback?.toLowerCase() ?? "";

  if (category.includes("missing item")) return "missing";
  if (category.includes("sandwich made wrong")) return "sandwich";
  if (category.includes("order accuracy") || type.includes("order accuracy")) return "accuracy";
  return null;
};

export const filterByAccuracyCategory = (
  feedbacks: CustomerFeedback[],
  category: AccuracyCategory | "all"
) =>
  category === "all"
    ? feedbacks.filter((fb) => classifyAccuracy(fb) !== null)
    : feedbacks.filter((fb) => classifyAccuracy(fb) === category);
