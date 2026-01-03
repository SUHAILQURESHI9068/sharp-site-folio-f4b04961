import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Trash2, Download, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
}

interface ClientDocumentsProps {
  projectId: string;
  projectName: string;
}

const ClientDocuments = ({ projectId, projectName }: ClientDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_documents")
      .select("*")
      .eq("project_id", projectId)
      .order("uploaded_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name);
      }
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !fileName) {
      toast.error("Please select a file and provide a name");
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${projectId}/${Date.now()}-${fileName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("client-documents")
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from("client_documents")
        .insert([{
          project_id: projectId,
          name: fileName,
          file_url: urlData.publicUrl,
          file_type: selectedFile.type,
        }]);

      if (dbError) throw dbError;

      toast.success("Document uploaded");
      setDialogOpen(false);
      setFileName("");
      setSelectedFile(null);
      fetchDocuments();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;

    try {
      // Extract file path from URL
      const urlParts = doc.file_url.split("/client-documents/");
      if (urlParts.length > 1) {
        await supabase.storage
          .from("client-documents")
          .remove([urlParts[1]]);
      }

      // Delete from database
      const { error } = await supabase
        .from("client_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      toast.success("Document deleted");
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const downloadDocument = (doc: Document) => {
    window.open(doc.file_url, "_blank");
  };

  const getFileIcon = (fileType: string | null) => {
    return <FileText className="w-5 h-5 text-primary" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Documents</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">Document Name</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Project Brief"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={uploadDocument} disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No documents uploaded
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.file_type)}
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadDocument(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDocument(doc)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientDocuments;
