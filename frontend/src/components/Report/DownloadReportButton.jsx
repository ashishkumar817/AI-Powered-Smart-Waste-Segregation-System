import { Download } from "lucide-react";
import Button from "../Button";
import ReportPDF from "./ReportPDF";

export default function DownloadReportButton({
  predictions,
  originalImage,
  processedImage,
  userName,
}) {
  const handleDownload = () => {
    ReportPDF({
      predictions,
      originalImage,
      processedImage,
      userName,
    });
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="w-full border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white transition-all duration-300"
    >
      <Download size={18} className="mr-2" />
      Download Report
    </Button>
  );
}