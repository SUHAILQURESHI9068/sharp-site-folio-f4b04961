import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calculator, RefreshCw, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  project_type: string;
  features: string[];
  estimated_price: number;
  message: string | null;
  created_at: string;
}

const QuoteRequests = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQuotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setQuotes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.project_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Project Type", "Features", "Estimated Price", "Message", "Date"];
    const csvData = filteredQuotes.map((quote) => [
      quote.name,
      quote.email,
      quote.project_type,
      quote.features.join("; "),
      quote.estimated_price.toString(),
      quote.message || "",
      format(new Date(quote.created_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `quote-requests-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
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
          <Calculator className="w-5 h-5 text-primary" />
          <CardTitle>Quote Requests</CardTitle>
          <Badge variant="secondary">{filteredQuotes.length}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchQuotes}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredQuotes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No quote requests found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Estimated Price</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${quote.email}`} className="text-primary hover:underline">
                        {quote.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{quote.project_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {quote.features.slice(0, 3).map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {quote.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{quote.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      ${quote.estimated_price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(quote.created_at), "MMM d, yyyy")}
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

export default QuoteRequests;