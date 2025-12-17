import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle>Meeting Bookings</CardTitle>
          <Badge variant="secondary">{bookings.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No meeting bookings yet</p>
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
                {bookings.map((booking) => (
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
