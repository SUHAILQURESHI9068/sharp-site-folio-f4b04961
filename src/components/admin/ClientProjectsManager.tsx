import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Briefcase, Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClientProject {
  id: string;
  client_email: string;
  project_name: string;
  description: string | null;
  status: string;
  progress: number;
  start_date: string | null;
  estimated_completion: string | null;
  created_at: string;
}

const emptyProject = {
  client_email: "",
  project_name: "",
  description: "",
  status: "in_progress",
  progress: 0,
  start_date: "",
  estimated_completion: "",
};

const statusOptions = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

const ClientProjectsManager = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [formData, setFormData] = useState(emptyProject);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewProjectDialog = () => {
    setEditingProject(null);
    setFormData(emptyProject);
    setDialogOpen(true);
  };

  const openEditDialog = (project: ClientProject) => {
    setEditingProject(project);
    setFormData({
      client_email: project.client_email,
      project_name: project.project_name,
      description: project.description || "",
      status: project.status,
      progress: project.progress,
      start_date: project.start_date || "",
      estimated_completion: project.estimated_completion || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.client_email || !formData.project_name) {
      toast.error("Please fill in required fields");
      return;
    }

    setSaving(true);
    
    const projectData = {
      client_email: formData.client_email,
      project_name: formData.project_name,
      description: formData.description || null,
      status: formData.status,
      progress: formData.progress,
      start_date: formData.start_date || null,
      estimated_completion: formData.estimated_completion || null,
    };

    if (editingProject) {
      const { error } = await supabase
        .from("client_projects")
        .update(projectData)
        .eq("id", editingProject.id);

      if (error) {
        toast.error("Failed to update project");
        console.error(error);
      } else {
        toast.success("Project updated");
        setDialogOpen(false);
        fetchProjects();
      }
    } else {
      const { error } = await supabase
        .from("client_projects")
        .insert([projectData]);

      if (error) {
        toast.error("Failed to create project");
        console.error(error);
      } else {
        toast.success("Project created");
        setDialogOpen(false);
        fetchProjects();
      }
    }
    
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all related data?")) return;

    const { error } = await supabase
      .from("client_projects")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete project");
    } else {
      toast.success("Project deleted");
      fetchProjects();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      planning: "outline",
      review: "secondary",
      on_hold: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-primary" />
          <CardTitle>Client Projects</CardTitle>
          <Badge variant="secondary">{projects.length}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNewProjectDialog}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingProject ? "Edit Project" : "Create Project"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client_email">Client Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_name">Project Name *</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    placeholder="Website Redesign"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Project details..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress ({formData.progress}%)</Label>
                    <Input
                      id="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_completion">Est. Completion</Label>
                    <Input
                      id="estimated_completion"
                      type="date"
                      value={formData.estimated_completion}
                      onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingProject ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={fetchProjects}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProjects.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No client projects found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <p className="font-medium">{project.project_name}</p>
                      {project.estimated_completion && (
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(project.estimated_completion), "MMM d, yyyy")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${project.client_email}`} className="text-primary hover:underline text-sm">
                        {project.client_email}
                      </a>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-24">
                        <Progress value={project.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(project)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientProjectsManager;
