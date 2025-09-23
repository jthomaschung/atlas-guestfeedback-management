import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "./FeedbackDialog";
import { MessageSquare } from "lucide-react";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-2 hover:bg-accent shadow-lg"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Feedback
      </Button>
      
      <FeedbackDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}