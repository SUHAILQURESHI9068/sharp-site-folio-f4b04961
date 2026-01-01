import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, RefreshCw, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface MeetingBooking {
  id: string;
  name: string;
  email: string;
  meeting_type: string;
  date: string;
  time: string;
  created_at: string;
}

const MeetingBookings = () => {
  const [bookings, setBookings] = useState<MeetingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("meeting_bookings")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.meeting_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Meeting Type", "Date", "Time", "Booked On"];
    const csvData = filteredBookings.map((booking) => [
      booking.name,
      booking.email,
      booking.meeting_type,
      format(new Date(booking.date), "yyyy-MM-dd"),
      booking.time,
      format(new Date(booking.created_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `meeting-bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getMeetingTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      consultation: "default",
      discovery: "secondary",
      technical: "outline",
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
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
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle>Meeting Bookings</CardTitle>
          <Badge variant="secondary">{filteredBookings.length}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No meeting bookings found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Booked On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${booking.email}`} className="text-primary hover:underline">
                        {booking.email}
                      </a>
                    </TableCell>
                    <TableCell>{getMeetingTypeBadge(booking.meeting_type)}</TableCell>
                    <TableCell>{format(new Date(booking.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(booking.created_at), "MMM d, yyyy")}
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

export default MeetingBookings;