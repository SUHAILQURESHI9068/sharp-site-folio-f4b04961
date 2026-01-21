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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Briefcase, Plus, Pencil, Trash2, Search, RefreshCw, FolderOpen, Download, IndianRupee, Phone, User, FileText, AlertTriangle, CheckCircle, Clock, Pause } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ClientDocuments from "./ClientDocuments";
import MilestoneManager from "./MilestoneManager";
import ProjectActivityLog from "./ProjectActivityLog";

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
  client_name: string | null;
  client_phone: string | null;
  project_type: string | null;
  budget: number | null;
  priority: string | null;
  tech_stack: string[] | null;
  notes: string | null;
}

const emptyProject = {
  client_email: "",
  project_name: "",
  description: "",
  status: "in_progress",
  progress: 0,
  start_date: "",
  estimated_completion: "",
  client_name: "",
  client_phone: "",
  project_type: "custom",
  budget: 0,
  priority: "medium",
  tech_stack: [] as string[],
  notes: "",
};

const statusOptions = [
  { value: "planning", label: "Planning", icon: Clock },
  { value: "in_progress", label: "In Progress", icon: Loader2 },
  { value: "review", label: "Review", icon: FileText },
  { value: "completed", label: "Completed", icon: CheckCircle },
  { value: "on_hold", label: "On Hold", icon: Pause },
];

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-gray-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

const projectTypeOptions = [
  { value: "landing", label: "Landing Page" },
  { value: "portfolio", label: "Portfolio" },
  { value: "business", label: "Business Website" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "webapp", label: "Web Application" },
  { value: "custom", label: "Custom Project" },
];

const techStackOptions = [
  "React", "Next.js", "WordPress", "Shopify", "HTML/CSS", "Node.js", "Python", "PHP", "Supabase", "MongoDB", "MySQL", "Tailwind CSS"
];

const ClientProjectsManager = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [formData, setFormData] = useState(emptyProject);
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data as ClientProject[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats calculations
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "in_progress").length,
    completed: projects.filter(p => p.status === "completed").length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      client_name: project.client_name || "",
      client_phone: project.client_phone || "",
      project_type: project.project_type || "custom",
      budget: project.budget || 0,
      priority: project.priority || "medium",
      tech_stack: project.tech_stack || [],
      notes: project.notes || "",
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
      client_name: formData.client_name || null,
      client_phone: formData.client_phone || null,
      project_type: formData.project_type || "custom",
      budget: formData.budget || 0,
      priority: formData.priority || "medium",
      tech_stack: formData.tech_stack.length > 0 ? formData.tech_stack : null,
      notes: formData.notes || null,
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
        
        // Send welcome email for new project
        try {
          await supabase.functions.invoke("welcome-email", {
            body: {
              type: "project_created",
              clientEmail: projectData.client_email,
              projectName: projectData.project_name,
            },
          });
        } catch (e) {
          console.error("Failed to send welcome email:", e);
        }
      }
    }
    
    setSaving(false);
  };

  const openProjectDetails = (project: ClientProject) => {
    setSelectedProject(project);
    setDetailsOpen(true);
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

  const exportToCSV = () => {
    const headers = ["Project Name", "Client Name", "Email", "Phone", "Type", "Budget", "Status", "Priority", "Progress", "Start Date", "Est. Completion"];
    const rows = filteredProjects.map(p => [
      p.project_name,
      p.client_name || "",
      p.client_email,
      p.client_phone || "",
      p.project_type || "",
      p.budget || 0,
      p.status,
      p.priority || "",
      p.progress,
      p.start_date || "",
      p.estimated_completion || ""
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
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

  const getPriorityBadge = (priority: string | null) => {
    const option = priorityOptions.find(p => p.value === priority);
    if (!option) return null;
    return (
      <Badge variant="outline" className="capitalize">
        <span className={`w-2 h-2 rounded-full ${option.color} mr-1`} />
        {option.label}
      </Badge>
    );
  };

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(tech)
        ? prev.tech_stack.filter(t => t !== tech)
        : [...prev.tech_stack, tech]
    }));
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
    <div className="space-y-4">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <CardTitle>Client Projects</CardTitle>
            <Badge variant="secondary">{filteredProjects.length}</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Priority</option>
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openNewProjectDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Client Details Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Client Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client_name">Client Name</Label>
                        <Input
                          id="client_name"
                          value={formData.client_name}
                          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client_phone">Phone Number</Label>
                      <Input
                        id="client_phone"
                        value={formData.client_phone}
                        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Project Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="project_type">Project Type</Label>
                        <select
                          id="project_type"
                          value={formData.project_type}
                          onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {projectTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Project details..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget (₹)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                          placeholder="15000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <select
                          id="priority"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {priorityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
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
                  </div>

                  {/* Tech Stack Section */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {techStackOptions.map(tech => (
                        <Badge
                          key={tech}
                          variant={formData.tech_stack.includes(tech) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTechStack(tech)}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Internal Notes
                    </h4>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Internal notes about the project..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingProject ? "Update Project" : "Create Project"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={fetchProjects}>
              <RefreshCw className="w-4 h-4" />
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
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
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
                        <div>
                          {project.client_name && (
                            <p className="font-medium text-sm">{project.client_name}</p>
                          )}
                          <a href={`mailto:${project.client_email}`} className="text-primary hover:underline text-xs">
                            {project.client_email}
                          </a>
                          {project.client_phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {project.client_phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {project.project_type?.replace("_", " ") || "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {project.budget ? formatCurrency(project.budget) : "-"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>{getPriorityBadge(project.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-24">
                          <Progress value={project.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openProjectDetails(project)}>
                            <FolderOpen className="w-4 h-4" />
                          </Button>
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

      {/* Project Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedProject && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedProject.project_name}</SheetTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(selectedProject.status)}
                  {getPriorityBadge(selectedProject.priority)}
                </div>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Project Info Card */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Project Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client:</span>
                      <span>{selectedProject.client_name || selectedProject.client_email}</span>
                    </div>
                    {selectedProject.client_phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{selectedProject.client_phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{selectedProject.project_type?.replace("_", " ") || "Custom"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{selectedProject.budget ? formatCurrency(selectedProject.budget) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span>{selectedProject.progress}%</span>
                    </div>
                    {selectedProject.tech_stack && selectedProject.tech_stack.length > 0 && (
                      <div className="pt-2">
                        <span className="text-muted-foreground block mb-2">Tech Stack:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedProject.tech_stack.map(tech => (
                            <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProject.notes && (
                      <div className="pt-2 border-t mt-3">
                        <span className="text-muted-foreground block mb-1">Notes:</span>
                        <p className="text-sm">{selectedProject.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>

                <MilestoneManager 
                  projectId={selectedProject.id} 
                  projectName={selectedProject.project_name}
                  clientEmail={selectedProject.client_email}
                />
                <ProjectActivityLog
                  projectId={selectedProject.id}
                  projectName={selectedProject.project_name}
                />
                <ClientDocuments 
                  projectId={selectedProject.id} 
                  projectName={selectedProject.project_name} 
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClientProjectsManager;