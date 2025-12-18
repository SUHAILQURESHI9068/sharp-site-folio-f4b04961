import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, RefreshCw, Download, Search, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubmissions(data as ContactSubmission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setSubmissions(prev => 
        prev.map(s => s.id === id ? { ...s, is_read: true } : s)
      );
      toast.success("Marked as read");
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Message", "Date", "Status"];
    const csvData = submissions.map(s => [
      s.name,
      s.email,
      `"${s.message.replace(/"/g, '""')}"`,
      format(new Date(s.created_at), "yyyy-MM-dd HH:mm:ss"),
      s.is_read ? "Read" : "Unread"
    ]);
    
    const csv = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const filteredSubmissions = submissions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = submissions.filter(s => !s.is_read).length;

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
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <CardTitle>Contact Submissions</CardTitle>
          <Badge variant="secondary">{submissions.length}</Badge>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSubmissions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSubmissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? "No results found" : "No contact submissions yet"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="max-w-xs">Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} className={!submission.is_read ? "bg-primary/5" : ""}>
                    <TableCell>
                      {submission.is_read ? (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="w-3 h-3" /> Read
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1">
                          <Eye className="w-3 h-3" /> New
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                        {submission.email}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{submission.message}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(submission.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {!submission.is_read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(submission.id)}
                        >
                          Mark Read
                        </Button>
                      )}
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

export default ContactSubmissions;