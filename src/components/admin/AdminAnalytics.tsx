import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Mail, Calendar, Calculator, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

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
      <Card>
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

  const statCards = [
    { title: "Total Contacts", value: data.totals.contacts, icon: Mail, color: "text-blue-500" },
    { title: "Total Meetings", value: data.totals.meetings, icon: Calendar, color: "text-green-500" },
    { title: "Total Quotes", value: data.totals.quotes, icon: Calculator, color: "text-purple-500" },
    { title: "Newsletter Subs", value: data.totals.newsletter, icon: Users, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <CardTitle>Submissions Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line type="monotone" dataKey="contacts" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="meetings" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="quotes" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="newsletter" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm">Quotes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">Newsletter</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="contacts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meetings" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quotes" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="newsletter" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;