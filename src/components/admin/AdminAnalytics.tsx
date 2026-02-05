import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import DashboardMetrics from "./DashboardMetrics";
import LiveActivityFeed from "./LiveActivityFeed";

interface DailyCount {
  date: string;
  count: number;
}

interface AnalyticsData {
  contacts: DailyCount[];
  meetings: DailyCount[];
  quotes: DailyCount[];
  newsletter: DailyCount[];
  totals: {
    contacts: number;
    meetings: number;
    quotes: number;
    newsletter: number;
  };
}

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    }).map(d => format(d, "yyyy-MM-dd"));

    const [contacts, meetings, quotes, newsletter] = await Promise.all([
      supabase.from("contact_submissions").select("created_at"),
      supabase.from("meeting_bookings").select("created_at"),
      supabase.from("quote_requests").select("created_at"),
      supabase.from("newsletter_subscriptions").select("subscribed_at")
    ]);

    const countByDay = (items: { created_at?: string; subscribed_at?: string }[] | null, dateField: string) => {
      const counts: Record<string, number> = {};
      last30Days.forEach(d => counts[d] = 0);
      
      items?.forEach(item => {
        const date = format(new Date((item as any)[dateField]), "yyyy-MM-dd");
        if (counts[date] !== undefined) {
          counts[date]++;
        }
      });
      
      return last30Days.map(date => ({ date, count: counts[date] }));
    };

    setData({
      contacts: countByDay(contacts.data, "created_at"),
      meetings: countByDay(meetings.data, "created_at"),
      quotes: countByDay(quotes.data, "created_at"),
      newsletter: countByDay(newsletter.data, "subscribed_at"),
      totals: {
        contacts: contacts.data?.length || 0,
        meetings: meetings.data?.length || 0,
        quotes: quotes.data?.length || 0,
        newsletter: newsletter.data?.length || 0
      }
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const combinedData = data.contacts.map((c, i) => ({
    date: format(new Date(c.date), "MMM d"),
    contacts: c.count,
    meetings: data.meetings[i].count,
    quotes: data.quotes[i].count,
    newsletter: data.newsletter[i].count
  }));

  return (
    <div className="space-y-6">
      {/* Dashboard Metrics */}
      <DashboardMetrics />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Server Load Style */}
        <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="w-5 h-5 text-primary" />
              SUBMISSIONS - LAST 30 DAYS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    interval="preserveStartEnd"
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--primary) / 0.3)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px hsl(var(--primary) / 0.1)"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="contacts" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorContacts)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="meetings" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMeetings)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="quotes" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorQuotes)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                <span className="text-sm text-muted-foreground">Contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                <span className="text-sm text-muted-foreground">Meetings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                <span className="text-sm text-muted-foreground">Quotes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <LiveActivityFeed />
      </div>

      {/* Daily Breakdown Bar Chart */}
      <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">DAILY BREAKDOWN - LAST 7 DAYS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--primary) / 0.3)",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="contacts" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Contacts" />
                <Bar dataKey="meetings" fill="#22c55e" radius={[4, 4, 0, 0]} name="Meetings" />
                <Bar dataKey="quotes" fill="#a855f7" radius={[4, 4, 0, 0]} name="Quotes" />
                <Bar dataKey="newsletter" fill="#f97316" radius={[4, 4, 0, 0]} name="Newsletter" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;