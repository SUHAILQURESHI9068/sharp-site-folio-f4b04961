import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, FileText, Plus, Pencil, Trash2, Search, RefreshCw, Download, IndianRupee, Eye, Send, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  project_id: string | null;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_address: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
}

interface ClientProject {
  id: string;
  project_name: string;
  client_email: string;
  client_name: string | null;
  client_phone: string | null;
  budget: number | null;
}

const emptyInvoice = {
  project_id: "",
  invoice_number: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  client_address: "",
  items: [{ description: "", quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[],
  subtotal: 0,
  tax_rate: 18,
  tax_amount: 0,
  total: 0,
  status: "draft",
  due_date: "",
  notes: "",
};

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-gray-500" },
  { value: "sent", label: "Sent", color: "bg-blue-500" },
  { value: "paid", label: "Paid", color: "bg-green-500" },
  { value: "overdue", label: "Overdue", color: "bg-red-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-400" },
];

const InvoiceManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState(emptyInvoice);

  const fetchData = async () => {
    setLoading(true);
    const [invoicesRes, projectsRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("client_projects").select("id, project_name, client_email, client_name, client_phone, budget")
    ]);

    if (invoicesRes.data) {
      const typedInvoices = invoicesRes.data.map(inv => ({
        ...inv,
        items: (inv.items as unknown as InvoiceItem[]) || []
      }));
      setInvoices(typedInvoices);
    }
    if (projectsRes.data) {
      setProjects(projectsRes.data as ClientProject[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateInvoiceNumber = () => {
    const prefix = "INV";
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}-${date}-${random}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const updateItemAmount = (index: number, field: keyof InvoiceItem, value: number | string) => {
    const newItems = [...formData.items];
    if (field === "description") {
      newItems[index].description = value as string;
    } else {
      newItems[index][field] = value as number;
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    const totals = calculateTotals(newItems, formData.tax_rate);
    setFormData({ ...formData, items: newItems, ...totals });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    const totals = calculateTotals(newItems, formData.tax_rate);
    setFormData({ ...formData, items: newItems, ...totals });
  };

  const updateTaxRate = (rate: number) => {
    const totals = calculateTotals(formData.items, rate);
    setFormData({ ...formData, tax_rate: rate, ...totals });
  };

  const openNewInvoiceDialog = () => {
    setEditingInvoice(null);
    setFormData({ ...emptyInvoice, invoice_number: generateInvoiceNumber() });
    setDialogOpen(true);
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      project_id: invoice.project_id || "",
      invoice_number: invoice.invoice_number,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      client_phone: invoice.client_phone || "",
      client_address: invoice.client_address || "",
      items: invoice.items.length > 0 ? invoice.items : [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      subtotal: invoice.subtotal,
      tax_rate: invoice.tax_rate,
      tax_amount: invoice.tax_amount,
      total: invoice.total,
      status: invoice.status,
      due_date: invoice.due_date || "",
      notes: invoice.notes || "",
    });
    setDialogOpen(true);
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const items: InvoiceItem[] = [{
        description: project.project_name,
        quantity: 1,
        rate: project.budget || 0,
        amount: project.budget || 0
      }];
      const totals = calculateTotals(items, formData.tax_rate);
      setFormData({
        ...formData,
        project_id: projectId,
        client_name: project.client_name || "",
        client_email: project.client_email,
        client_phone: project.client_phone || "",
        items,
        ...totals
      });
    }
  };

  const handleSave = async () => {
    if (!formData.client_name || !formData.client_email || !formData.invoice_number) {
      toast.error("Please fill in required fields");
      return;
    }

    setSaving(true);
    
    const invoiceData = {
      project_id: formData.project_id || null,
      invoice_number: formData.invoice_number,
      client_name: formData.client_name,
      client_email: formData.client_email,
      client_phone: formData.client_phone || null,
      client_address: formData.client_address || null,
      items: JSON.parse(JSON.stringify(formData.items)),
      subtotal: formData.subtotal,
      tax_rate: formData.tax_rate,
      tax_amount: formData.tax_amount,
      total: formData.total,
      status: formData.status,
      due_date: formData.due_date || null,
      notes: formData.notes || null,
    };

    if (editingInvoice) {
      const { error } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", editingInvoice.id);

      if (error) {
        toast.error("Failed to update invoice");
        console.error(error);
      } else {
        toast.success("Invoice updated");
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("invoices")
        .insert([invoiceData]);

      if (error) {
        toast.error("Failed to create invoice");
        console.error(error);
      } else {
        toast.success("Invoice created");
        setDialogOpen(false);
        fetchData();
      }
    }
    
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete invoice");
    } else {
      toast.success("Invoice deleted");
      fetchData();
    }
  };

  const markAsPaid = async (invoice: Invoice) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_date: new Date().toISOString().split('T')[0] })
      .eq("id", invoice.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Invoice marked as paid");
      fetchData();
    }
  };

  const openPreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setPreviewOpen(true);
  };

  const sendInvoiceEmail = async (invoice: Invoice) => {
    setSending(invoice.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { invoice }
      });

      if (error) throw error;
      
      // Update status to sent if it was draft
      if (invoice.status === 'draft') {
        await supabase
          .from('invoices')
          .update({ status: 'sent' })
          .eq('id', invoice.id);
        fetchData();
      }
      
      toast.success(`Invoice sent to ${invoice.client_email}`);
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error(error.message || 'Failed to send invoice');
    } finally {
      setSending(null);
    }
  };

  const downloadPDF = (invoice: Invoice) => {
    // Generate simple HTML invoice for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #4F46E5; }
          .invoice-number { color: #666; margin-top: 5px; }
          .client-info { margin-bottom: 30px; }
          .client-info h3 { margin-bottom: 10px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #F3F4F6; padding: 12px; text-align: left; border-bottom: 2px solid #E5E7EB; }
          td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
          .totals { text-align: right; }
          .totals td { padding: 8px 12px; }
          .total-row { font-weight: bold; font-size: 18px; background: #F3F4F6; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #666; font-size: 14px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-paid { background: #D1FAE5; color: #065F46; }
          .status-sent { background: #DBEAFE; color: #1E40AF; }
          .status-draft { background: #F3F4F6; color: #374151; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${invoice.invoice_number}</div>
          </div>
          <div style="text-align: right;">
            <div><strong>Date:</strong> ${format(new Date(invoice.created_at), "MMM d, yyyy")}</div>
            ${invoice.due_date ? `<div><strong>Due:</strong> ${format(new Date(invoice.due_date), "MMM d, yyyy")}</div>` : ''}
            <div class="status status-${invoice.status}">${invoice.status.toUpperCase()}</div>
          </div>
        </div>
        
        <div class="client-info">
          <h3>Bill To:</h3>
          <div><strong>${invoice.client_name}</strong></div>
          <div>${invoice.client_email}</div>
          ${invoice.client_phone ? `<div>${invoice.client_phone}</div>` : ''}
          ${invoice.client_address ? `<div>${invoice.client_address}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="width: 80px; text-align: center;">Qty</th>
              <th style="width: 120px; text-align: right;">Rate</th>
              <th style="width: 120px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.rate.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${item.amount.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="totals" style="width: 300px; margin-left: auto;">
          <tr>
            <td>Subtotal:</td>
            <td>₹${invoice.subtotal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>GST (${invoice.tax_rate}%):</td>
            <td>₹${invoice.tax_amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td>₹${invoice.total.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        ${invoice.notes ? `
          <div class="footer">
            <strong>Notes:</strong><br/>
            ${invoice.notes}
          </div>
        ` : ''}

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === "paid").length,
    pending: invoices.filter(i => i.status === "sent").length,
    totalAmount: invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.total, 0),
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      paid: "default",
      sent: "secondary",
      draft: "outline",
      overdue: "destructive",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "outline"} className="capitalize">{status}</Badge>;
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
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.paid}</p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Send className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              <p className="text-xs text-muted-foreground">Total Collected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Invoices</CardTitle>
            <Badge variant="secondary">{filteredInvoices.length}</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openNewInvoiceDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingInvoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Link to Project */}
                  <div className="space-y-2">
                    <Label>Link to Project (Optional)</Label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => handleProjectSelect(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select a project...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.project_name} - {p.client_email}</option>
                      ))}
                    </select>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Invoice Number *</Label>
                      <Input
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        placeholder="INV-20240101-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Client Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client Name *</Label>
                      <Input
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Client Email *</Label>
                      <Input
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="client@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.client_phone}
                        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={formData.client_address}
                      onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                      placeholder="Client address..."
                      rows={2}
                    />
                  </div>

                  {/* Line Items */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label>Line Items</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                      </Button>
                    </div>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItemAmount(index, "description", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItemAmount(index, "quantity", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => updateItemAmount(index, "rate", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            readOnly
                            value={formatCurrency(item.amount)}
                            className="bg-muted"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end pt-4">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(formData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm items-center gap-2">
                        <span>GST:</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-16 h-8 text-center"
                            value={formData.tax_rate}
                            onChange={(e) => updateTaxRate(parseInt(e.target.value) || 0)}
                          />
                          <span>%</span>
                          <span className="w-20 text-right">{formatCurrency(formData.tax_amount)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(formData.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Payment terms, bank details, etc..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingInvoice ? "Update Invoice" : "Create Invoice"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invoices found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{invoice.client_name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.client_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(invoice.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openPreview(invoice)} title="Preview">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => sendInvoiceEmail(invoice)} 
                            disabled={sending === invoice.id}
                            title="Send Email"
                          >
                            {sending === invoice.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 text-primary" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadPDF(invoice)} title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                          {invoice.status !== "paid" && (
                            <Button variant="ghost" size="sm" onClick={() => markAsPaid(invoice)} title="Mark as Paid" className="text-emerald-600 hover:text-emerald-700">
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(invoice)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
                  <p className="text-muted-foreground">{previewInvoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <p><strong>Date:</strong> {format(new Date(previewInvoice.created_at), "MMM d, yyyy")}</p>
                  {previewInvoice.due_date && (
                    <p><strong>Due:</strong> {format(new Date(previewInvoice.due_date), "MMM d, yyyy")}</p>
                  )}
                  {getStatusBadge(previewInvoice.status)}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="font-medium">{previewInvoice.client_name}</p>
                <p className="text-sm text-muted-foreground">{previewInvoice.client_email}</p>
                {previewInvoice.client_phone && <p className="text-sm text-muted-foreground">{previewInvoice.client_phone}</p>}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewInvoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(previewInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({previewInvoice.tax_rate}%):</span>
                    <span>{formatCurrency(previewInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(previewInvoice.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => sendInvoiceEmail(previewInvoice)} 
                  disabled={sending === previewInvoice.id}
                  className="bg-primary hover:bg-primary/90"
                >
                  {sending === previewInvoice.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Invoice
                </Button>
                <Button variant="outline" onClick={() => downloadPDF(previewInvoice)}>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button variant="ghost" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManager;