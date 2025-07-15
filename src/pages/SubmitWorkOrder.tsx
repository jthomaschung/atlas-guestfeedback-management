import React from "react";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderFormData } from "@/types/work-order";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SubmitWorkOrder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (formData: WorkOrderFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Work order submitted",
      description: `Work order for ${formData.repair_type} at store ${formData.store_number} has been submitted successfully.`,
    });
    
    navigate("/dashboard");
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