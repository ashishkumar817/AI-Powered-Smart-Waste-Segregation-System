
import Button from "../Button";
import ReportPDF from "./ReportPDF";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";



export default function EmailReportButton({
    predictions,
    originalImage,
    processedImage,
}) {

    const { user, token } = useContext(AuthContext);
    const [isSending, setIsSending] = useState(false);
    const handleEmail = async () => {
    try {
        setIsSending(true);

        const pdf = await ReportPDF({
            predictions,
            originalImage,
            processedImage,
            userName: user.username,
            download: false,
        });

        await axios.post(
            "http://127.0.0.1:5000/api/email-report",
            { pdf },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        toast.success("📧 Report emailed successfully!");

    } catch (err) {
        console.error(err);
        toast.error("Failed to send report.");
    } finally {
        setIsSending(false);
    }
};

    return (
        <Button
          onClick={handleEmail}
          disabled={isSending}
          className="w-full bg-primary-green text-white"
      >
          {isSending ? (
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
              </>
          ) : (
              <>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Report
              </>
          )}
      </Button>
    );
}