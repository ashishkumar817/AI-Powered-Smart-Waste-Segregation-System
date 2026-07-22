import { Mail } from "lucide-react";
import Button from "../Button";

export default function EmailReportButton() {

  return (

    <Button
      className="w-full"
      variant="primary"
    >
      <Mail size={18}/>
      Email Report
    </Button>

  );

}