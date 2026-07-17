import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress
} from "@mui/material";
import api from "../../api/axiosConfig";

type ImportRow = {
  rowNumber: number;
  productName: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  defaultReorderLevel: number;
  openingStockQty: number;
  isActive: boolean;
  status: string;
  errors: string[];
};

type ValidationResult = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: string[];
  rows: ImportRow[];
};

export default function ProductsImportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [validationData, setValidationData] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCommitted, setIsCommitted] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/admin/products/import/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product-import-template.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setError("Failed to download template.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setValidationData(null);
      setError("");
      setSuccess("");
      setIsCommitted(false);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/admin/products/import/validate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setValidationData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to validate file.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/admin/products/import/commit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(`Import successful! Created ${response.data.created} products. Skipped ${response.data.skipped} rows.`);
      setIsCommitted(true);
      setValidationData(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to commit import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" className="page-title" sx={{ fontWeight: "bold" }}>
          Bulk Product Import
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/admin/products")}>
          Back to Products
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!isCommitted && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Step 1: Download Template</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Use our standard CSV template to prepare your products.
            </Typography>
            <Button variant="outlined" onClick={handleDownloadTemplate} sx={{ mb: 3 }}>
              Download Template
            </Button>

            <Typography variant="h6" gutterBottom>Step 2: Upload CSV</Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button variant="contained" component="label">
                Select File
                <input type="file" hidden accept=".csv" onChange={handleFileChange} />
              </Button>
              <Typography>{file ? file.name : "No file selected"}</Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleValidate}
                disabled={!file || loading}
              >
                {loading ? <CircularProgress size={24} /> : "Validate File"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {validationData && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Validation Results</Typography>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleCommit}
              disabled={loading || validationData.validRows === 0}
            >
              Import {validationData.validRows} Valid Rows
            </Button>
          </Box>
          
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Chip label={`Total: ${validationData.totalRows}`} color="default" />
            <Chip label={`Valid: ${validationData.validRows}`} color="success" />
            <Chip label={`Invalid: ${validationData.invalidRows}`} color="error" />
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "var(--table-header-bg)" }}>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Reorder Lvl</TableCell>
                  <TableCell>Opening Qty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validationData.rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.rowNumber}</TableCell>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.unitPrice}</TableCell>
                    <TableCell>{row.costPrice}</TableCell>
                    <TableCell>{row.defaultReorderLevel}</TableCell>
                    <TableCell>{row.openingStockQty}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        color={row.status === "VALID" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {row.errors.map((err, i) => (
                        <div key={i} style={{ color: "red", fontSize: "0.8rem" }}>{err}</div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
