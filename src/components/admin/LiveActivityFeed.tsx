import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle, Clock, AlertCircle, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
  amount?: number;
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchActivities();
    
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const fetchActivities = async () => {
    const [contacts, meetings, quotes, portfolioProjects] = await Promise.all([
      supabase.from("contact_submissions").select("id, name, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("meeting_bookings").select("id, name, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("quote_requests").select("id, name, estimated_price, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("portfolio_projects").select("id, title, revenue, status, created_at").order("created_at", { ascending: false }).limit(10)
    ]);

    const allActivities: ActivityItem[] = [
      ...(contacts.data || []).map(c => ({
        id: `contact-${c.id}`,
        type: "CTX",
        title: `Contact from ${c.name}`,
        timestamp: c.created_at,
        status: "success" as const
      })),
      ...(meetings.data || []).map(m => ({
        id: `meeting-${m.id}`,
        type: "MTG",
        title: `Meeting booked by ${m.name}`,
        timestamp: m.created_at,
        status: "pending" as const
      })),
      ...(quotes.data || []).map(q => ({
        id: `quote-${q.id}`,
        type: "QTE",
        title: `Quote request from ${q.name}`,
        timestamp: q.created_at,
        status: "success" as const,
        amount: q.estimated_price
      })),
      ...(portfolioProjects.data || []).map(p => ({
        id: `project-${p.id}`,
        type: "PRJ",
        title: p.title,
        timestamp: p.created_at,
        status: p.status === "completed" ? "success" as const : p.status === "cancelled" ? "failed" as const : "pending" as const,
        amount: Number(p.revenue) || 0
      }))
    ];

    // Sort by timestamp descending
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setActivities(allActivities.slice(0, 20));
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30">SUCCESS</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30">PENDING</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30">FAILED</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading activity feed...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          LIVE ACTIVITY FEED
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-primary">
            {format(currentTime, "HH:mm:ss")} IST
          </span>
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-1">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-mono"
              >
                <span className="text-cyan-400 font-semibold w-10">{activity.type}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground w-32">
                  {format(new Date(activity.timestamp), "yyyy-MM-dd HH:mm")}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="flex-1 truncate text-foreground">{activity.title}</span>
                {activity.amount !== undefined && activity.amount > 0 && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-green-400 w-24 text-right">{formatCurrency(activity.amount)}</span>
                  </>
                )}
                <span className="text-muted-foreground">|</span>
                {getStatusBadge(activity.status)}
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No recent activity
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;