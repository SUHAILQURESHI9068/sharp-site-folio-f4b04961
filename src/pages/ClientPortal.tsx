import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Loader2, Briefcase, FileText, CheckCircle2, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";

interface ClientProject {
  id: string;
  project_name: string;
  description: string | null;
  status: string;
  progress: number;
  start_date: string | null;
  estimated_completion: string | null;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
}

const ClientPortal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProjects(), 0);
        } else {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProjects();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data: projectsData, error } = await supabase
      .from("client_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && projectsData) {
      setProjects(projectsData);
      
      // Fetch milestones for each project
      for (const project of projectsData) {
        const { data: milestonesData } = await supabase
          .from("client_milestones")
          .select("*")
          .eq("project_id", project.id)
          .order("due_date", { ascending: true });
        
        if (milestonesData) {
          setMilestones(prev => ({ ...prev, [project.id]: milestonesData }));
        }
      }
    }
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/portal` }
        });
        if (error) throw error;
        toast.success("Account created! You can now access your projects.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProjects([]);
    toast.success("Signed out");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      planning: "outline",
      review: "secondary",
      on_hold: "destructive",
    };
    return colors[status] || "outline";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>{isSignUp ? "Create Account" : "Client Portal"}</CardTitle>
            <CardDescription>Access your project dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
              </button>
            </div>
            <Button variant="ghost" onClick={() => navigate("/")} className="w-full mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Client Portal</h1>
            <p className="text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground">
                Your projects will appear here once they're set up.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        {project.project_name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="mt-1">{project.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant={getStatusColor(project.status)} className="capitalize">
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {project.start_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Started:</span>
                        <span>{format(new Date(project.start_date), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {project.estimated_completion && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Est. Completion:</span>
                        <span>{format(new Date(project.estimated_completion), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  {milestones[project.id] && milestones[project.id].length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Milestones
                      </h4>
                      <div className="space-y-2">
                        {milestones[project.id].map((milestone) => (
                          <div
                            key={milestone.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              milestone.is_completed ? "bg-muted/50" : "bg-background"
                            }`}
                          >
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                milestone.is_completed ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                            <div className="flex-1">
                              <p className={milestone.is_completed ? "line-through text-muted-foreground" : ""}>
                                {milestone.title}
                              </p>
                              {milestone.due_date && (
                                <p className="text-xs text-muted-foreground">
                                  Due: {format(new Date(milestone.due_date), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                            {milestone.is_completed && (
                              <Badge variant="outline" className="text-xs">Complete</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
