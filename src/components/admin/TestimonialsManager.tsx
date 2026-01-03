import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Search, RefreshCw, Check, X, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Testimonial {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  content: string;
  rating: number;
  is_approved: boolean | null;
  is_featured: boolean | null;
  created_at: string;
}

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const filteredTestimonials = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = testimonials.filter((t) => !t.is_approved).length;

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    const { error } = await supabase
      .from("testimonials")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update testimonial");
    } else {
      toast.success("Testimonial updated");
      fetchTestimonials();
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete testimonial");
    } else {
      toast.success("Testimonial deleted");
      fetchTestimonials();
    }
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
          <MessageSquare className="w-5 h-5 text-primary" />
          <CardTitle>Testimonials</CardTitle>
          <Badge variant="secondary">{testimonials.length}</Badge>
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount} pending</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchTestimonials}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTestimonials.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No testimonials found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-xs">Content</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id} className={!testimonial.is_approved ? "bg-muted/50" : ""}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={testimonial.is_approved ? "default" : "secondary"}>
                          {testimonial.is_approved ? "Approved" : "Pending"}
                        </Badge>
                        {testimonial.is_featured && (
                          <Badge variant="outline" className="text-xs">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        {testimonial.role && testimonial.company && (
                          <p className="text-xs text-muted-foreground">
                            {testimonial.role} at {testimonial.company}
                          </p>
                        )}
                        <a href={`mailto:${testimonial.email}`} className="text-xs text-primary hover:underline">
                          {testimonial.email}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm">{testimonial.content}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(testimonial.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!testimonial.is_approved ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateTestimonial(testimonial.id, { is_approved: true })}
                            className="text-green-600 hover:text-green-700"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateTestimonial(testimonial.id, { is_approved: false })}
                            title="Unapprove"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTestimonial(testimonial.id, { is_featured: !testimonial.is_featured })}
                          className={testimonial.is_featured ? "text-yellow-600" : ""}
                          title={testimonial.is_featured ? "Unfeature" : "Feature"}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTestimonial(testimonial.id)}
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

export default TestimonialsManager;
