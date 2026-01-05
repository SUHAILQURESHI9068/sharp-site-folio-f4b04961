import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Pencil, Trash2, Loader2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface MilestoneManagerProps {
  projectId: string;
  projectName: string;
  clientEmail: string;
}

const emptyMilestone = {
  title: "",
  description: "",
  due_date: "",
};

const MilestoneManager = ({ projectId, projectName, clientEmail }: MilestoneManagerProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState(emptyMilestone);

  const fetchMilestones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_milestones")
      .select("*")
      .eq("project_id", projectId)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (!error && data) {
      setMilestones(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const openNewDialog = () => {
    setEditingMilestone(null);
    setFormData(emptyMilestone);
    setDialogOpen(true);
  };

  const openEditDialog = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || "",
      due_date: milestone.due_date || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Please enter a milestone title");
      return;
    }

    setSaving(true);

    const milestoneData = {
      project_id: projectId,
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date || null,
    };

    if (editingMilestone) {
      const { error } = await supabase
        .from("client_milestones")
        .update(milestoneData)
        .eq("id", editingMilestone.id);

      if (error) {
        toast.error("Failed to update milestone");
      } else {
        toast.success("Milestone updated");
        setDialogOpen(false);
        fetchMilestones();
      }
    } else {
      const { error } = await supabase
        .from("client_milestones")
        .insert([milestoneData]);

      if (error) {
        toast.error("Failed to create milestone");
      } else {
        toast.success("Milestone created");
        setDialogOpen(false);
        fetchMilestones();
      }
    }

    setSaving(false);
  };

  const toggleComplete = async (milestone: Milestone) => {
    const isNowComplete = !milestone.is_completed;
    
    const { error } = await supabase
      .from("client_milestones")
      .update({
        is_completed: isNowComplete,
        completed_at: isNowComplete ? new Date().toISOString() : null,
      })
      .eq("id", milestone.id);

    if (error) {
      toast.error("Failed to update milestone");
    } else {
      // Send notification if milestone completed
      if (isNowComplete) {
        try {
          await supabase.functions.invoke("notify-milestone", {
            body: {
              clientEmail,
              projectName,
              milestoneTitle: milestone.title,
              type: "milestone_completed",
            },
          });
        } catch (e) {
          console.error("Failed to send notification:", e);
        }
      }
      fetchMilestones();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this milestone?")) return;

    const { error } = await supabase
      .from("client_milestones")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete milestone");
    } else {
      toast.success("Milestone deleted");
      fetchMilestones();
    }
  };

  const completedCount = milestones.filter((m) => m.is_completed).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Milestones</CardTitle>
          <span className="text-sm text-muted-foreground">
            ({completedCount}/{milestones.length})
          </span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMilestone ? "Edit Milestone" : "Add Milestone"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Design mockups approval"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about this milestone..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingMilestone ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : milestones.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No milestones added
          </p>
        ) : (
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  milestone.is_completed ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                }`}
              >
                <button
                  onClick={() => toggleComplete(milestone)}
                  className="mt-0.5 hover:scale-110 transition-transform"
                >
                  {milestone.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      milestone.is_completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {milestone.title}
                  </p>
                  {milestone.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {milestone.description}
                    </p>
                  )}
                  {milestone.due_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {format(new Date(milestone.due_date), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(milestone)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(milestone.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneManager;
