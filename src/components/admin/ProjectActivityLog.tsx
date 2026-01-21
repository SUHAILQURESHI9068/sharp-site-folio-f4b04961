import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, MessageSquare, CheckCircle, AlertCircle, Phone, Mail, FileText, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProjectActivity {
  id: string;
  project_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

interface ProjectActivityLogProps {
  projectId: string;
  projectName: string;
}

const activityTypes = [
  { value: "note", label: "Note", icon: MessageSquare, color: "bg-blue-500" },
  { value: "call", label: "Phone Call", icon: Phone, color: "bg-green-500" },
  { value: "email", label: "Email", icon: Mail, color: "bg-purple-500" },
  { value: "milestone", label: "Milestone", icon: CheckCircle, color: "bg-emerald-500" },
  { value: "issue", label: "Issue", icon: AlertCircle, color: "bg-red-500" },
  { value: "document", label: "Document", icon: FileText, color: "bg-orange-500" },
  { value: "update", label: "Status Update", icon: Clock, color: "bg-yellow-500" },
];

const ProjectActivityLog = ({ projectId, projectName }: ProjectActivityLogProps) => {
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: "note",
    title: "",
    description: "",
    created_by: "",
  });

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_activities")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activities");
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("project_activities").insert([
      {
        project_id: projectId,
        activity_type: formData.activity_type,
        title: formData.title,
        description: formData.description || null,
        created_by: formData.created_by || null,
      },
    ]);

    if (error) {
      console.error("Error adding activity:", error);
      toast.error("Failed to add activity");
    } else {
      toast.success("Activity added");
      setDialogOpen(false);
      setFormData({ activity_type: "note", title: "", description: "", created_by: "" });
      fetchActivities();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this activity?")) return;

    const { error } = await supabase
      .from("project_activities")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete activity");
    } else {
      toast.success("Activity deleted");
      fetchActivities();
    }
  };

  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type);
    if (!activity) return MessageSquare;
    return activity.icon;
  };

  const getActivityColor = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type);
    return activity?.color || "bg-gray-500";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Activity Log</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, activity_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Brief summary"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Details..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Added By</Label>
                <Input
                  placeholder="Your name"
                  value={formData.created_by}
                  onChange={(e) =>
                    setFormData({ ...formData, created_by: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activities yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.activity_type);
                  const color = getActivityColor(activity.activity_type);

                  return (
                    <div key={activity.id} className="relative pl-10 group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2 w-5 h-5 rounded-full ${color} flex items-center justify-center`}
                      >
                        <Icon className="w-3 h-3 text-white" />
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 relative">
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-start justify-between gap-2 pr-6">
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="capitalize text-xs">
                            {activity.activity_type}
                          </Badge>
                          <span>•</span>
                          <span>{format(new Date(activity.created_at), "MMM d, h:mm a")}</span>
                          {activity.created_by && (
                            <>
                              <span>•</span>
                              <span>{activity.created_by}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectActivityLog;
