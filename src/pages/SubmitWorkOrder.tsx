import React from "react";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderFormData } from "@/types/work-order";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SubmitWorkOrder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (formData: WorkOrderFormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create work orders.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('work_orders')
        .insert([{
          user_id: user.id,
          description: formData.description,
          repair_type: formData.repair_type,
          store_number: formData.store_number,
          market: formData.market,
          priority: formData.priority,
          ecosure: formData.ecosure,
          status: 'pending'
        }]);

      if (error) {
        console.error('Error creating work order:', error);
        toast({
          title: "Error",
          description: "Failed to create work order. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Work order submitted",
        description: `Work order for ${formData.repair_type} at store ${formData.store_number} has been submitted successfully.`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Submit New Work Order</h1>
        <p className="text-muted-foreground mt-1">
          Create a new maintenance request for your store
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <WorkOrderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default SubmitWorkOrder;