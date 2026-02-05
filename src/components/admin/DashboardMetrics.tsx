import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  FolderKanban,
  Mail,
  Calendar
} from "lucide-react";

interface MetricsData {
  totalRevenue: number;
  totalLoss: number;
  totalProfit: number;
  projectsCount: number;
  contactsCount: number;
  meetingsCount: number;
  activeProjects: number;
  completedProjects: number;
}

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const [portfolioRes, contactsRes, meetingsRes, clientProjectsRes] = await Promise.all([
      supabase.from("portfolio_projects").select("revenue, loss, status"),
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
      supabase.from("meeting_bookings").select("id", { count: "exact", head: true }),
      supabase.from("client_projects").select("status")
    ]);

    const portfolioData = portfolioRes.data || [];
    const totalRevenue = portfolioData.reduce((sum, p) => sum + (Number(p.revenue) || 0), 0);
    const totalLoss = portfolioData.reduce((sum, p) => sum + (Number(p.loss) || 0), 0);

    const clientProjects = clientProjectsRes.data || [];
    
    setMetrics({
      totalRevenue,
      totalLoss,
      totalProfit: totalRevenue - totalLoss,
      projectsCount: portfolioData.length,
      contactsCount: contactsRes.count || 0,
      meetingsCount: meetingsRes.count || 0,
      activeProjects: clientProjects.filter(p => p.status === "in_progress").length,
      completedProjects: clientProjects.filter(p => p.status === "completed").length
    });
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Gauge component for circular progress
  const GaugeChart = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted/20"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>{Math.round(percentage)}%</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-gradient-to-br from-background to-muted/20 border-primary/20 animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* System Health & Performance */}
      <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="w-5 h-5 text-primary" />
            SYSTEM HEALTH & PERFORMANCE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-8">
            <GaugeChart 
              value={metrics.activeProjects} 
              max={Math.max(metrics.activeProjects + metrics.completedProjects, 10)} 
              label="Active Load" 
              color="#8b5cf6" 
            />
            <GaugeChart 
              value={metrics.completedProjects} 
              max={Math.max(metrics.activeProjects + metrics.completedProjects, 10)} 
              label="Completed" 
              color="#06b6d4" 
            />
            <GaugeChart 
              value={metrics.projectsCount} 
              max={Math.max(metrics.projectsCount + 5, 20)} 
              label="Portfolio" 
              color="#22c55e" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-green-500 mt-1">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Loss</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(metrics.totalLoss)}</p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Profit</p>
                <p className={`text-2xl font-bold mt-1 ${metrics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(metrics.totalProfit)}
                </p>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Projects</p>
                <p className="text-2xl font-bold text-cyan-500 mt-1">{metrics.projectsCount}</p>
              </div>
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <FolderKanban className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{metrics.contactsCount}</p>
                <p className="text-sm text-muted-foreground">Contact Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{metrics.meetingsCount}</p>
                <p className="text-sm text-muted-foreground">Meeting Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;