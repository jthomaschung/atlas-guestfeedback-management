import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Edit2, Save, X, Plus, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject_line: string;
  email_body: string;
  description: string;
  category: string;
  updated_at: string;
}

export default function EmailTemplates() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("category", { ascending: true })
        .order("template_name", { ascending: true });

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (template: EmailTemplate) => {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject_line: template.subject_line,
          email_body: template.email_body,
          template_name: template.template_name,
          description: template.description,
        })
        .eq("id", template.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setEditingTemplate(null);
      setIsDialogOpen(false);
      toast.success("Template updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTemplate) {
      updateMutation.mutate(editingTemplate);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general":
        return "bg-blue-100 text-blue-800";
      case "positive":
        return "bg-green-100 text-green-800";
      case "escalation":
        return "bg-red-100 text-red-800";
      case "resolution":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const groupedTemplates = templates?.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Mail className="h-8 w-8" />
          Customer Outreach Email Templates
        </h1>
        <p className="text-muted-foreground">
          Manage email templates used for customer feedback responses
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Available Variables:</strong> Use <code className="bg-muted px-1.5 py-0.5 rounded">{"{{customer_name}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded">{"{{store_name}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded">{"{{resolution_details}}"}</code> in your templates. These will be automatically replaced with actual values when sending emails.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={Object.keys(groupedTemplates || {})[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {Object.keys(groupedTemplates || {}).map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedTemplates || {}).map(([category, categoryTemplates]) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 md:grid-cols-2">
              {categoryTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{template.template_name}</CardTitle>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Subject Line</Label>
                        <p className="text-sm font-medium mt-1">{template.subject_line}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Email Body Preview</Label>
                        <p className="text-sm mt-1 line-clamp-3 text-muted-foreground whitespace-pre-wrap">
                          {template.email_body}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Updated</Label>
                        <p className="text-xs mt-1">
                          {new Date(template.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Customize the email template for customer outreach
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="template_name">Template Name</Label>
                <Input
                  id="template_name"
                  value={editingTemplate.template_name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, template_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingTemplate.description}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="subject_line">Subject Line</Label>
                <Input
                  id="subject_line"
                  value={editingTemplate.subject_line}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, subject_line: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="email_body">Email Body</Label>
                <Textarea
                  id="email_body"
                  value={editingTemplate.email_body}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, email_body: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use {"{{customer_name}}"}, {"{{store_name}}"}, {"{{resolution_details}}"} as placeholders
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
