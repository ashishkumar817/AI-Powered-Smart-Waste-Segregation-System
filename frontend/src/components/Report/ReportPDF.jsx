import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../../assets/logo.png";

const ReportPDF = async ({
  predictions,
  originalImage,
  processedImage,
  userName = "Guest User",
}) => {

  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let logoBase64 = null;
  try {
    const response = await fetch(logoImg);
    const blob = await response.blob();
    logoBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to fetch logo", err);
  }

  const GREEN = [22, 163, 74];
  const DARK = [40, 40, 40];
  const LIGHT = [245, 248, 246];

  const now = new Date();

  const reportId =
  `SWAI-${now.getFullYear()}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}-${Math.floor(
    100000 + Math.random() * 900000
  )}`;

  //----------------------------------------------------
  // Background
  //----------------------------------------------------

  doc.setFillColor(250,250,250);
  doc.rect(0,0,pageWidth,pageHeight,"F");

  //----------------------------------------------------
  // Header Strip
  //----------------------------------------------------

  doc.setFillColor(...GREEN);
  doc.roundedRect(
      0,
      0,
      pageWidth,
      28,
      0,
      0,
      "F"
  );

  //----------------------------------------------------
  // Logo
  //----------------------------------------------------

  if (logoBase64) {
    // Add the logo image. Match height of the title text block.
    // 20x20 size fits perfectly in the header strip (height 28).
    doc.addImage(logoBase64, "PNG", 8, 4, 20, 20);
  } else {
    // Fallback Logo Circle
    doc.setFillColor(255,255,255);
    doc.circle(20,14,7,"F");
  
    doc.setTextColor(...GREEN);
    doc.setFontSize(16);
    doc.text("♻",20,16,{
        align:"center"
    });
  }

  //----------------------------------------------------
  // Title
  //----------------------------------------------------

  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold");
  doc.setFontSize(22);

  doc.text(
      "Smart Waste AI",
      32,
      14
  );

  doc.setFontSize(10);

  doc.text(
      "AI Powered Waste Detection",
      32,
      21
  );

  //----------------------------------------------------
  // Report Title
  //----------------------------------------------------

  doc.setTextColor(...DARK);

  doc.setFontSize(18);

  doc.setFont(
      "helvetica",
      "bold"
  );

  doc.text(
      "Waste Detection Report",
      pageWidth/2,
      42,
      {
          align:"center"
      }
  );

  //----------------------------------------------------
  // Info Card
  //----------------------------------------------------

  doc.setFillColor(...LIGHT);

  doc.roundedRect(
      14,
      50,
      pageWidth-28,
      36,
      4,
      4,
      "F"
  );

  doc.setFontSize(11);

  doc.setTextColor(80);

  doc.text(
      "Report ID",
      22,
      61
  );

  doc.text(
      "User",
      22,
      69
  );

  doc.text(
      "Date",
      110,
      61
  );

  doc.text(
      "Time",
      110,
      69
  );

  doc.setFont(
      "helvetica",
      "bold"
  );

  doc.setTextColor(...DARK);

  doc.text(
      reportId,
      45,
      61
  );

  doc.text(
      userName,
      45,
      69
  );

  doc.text(
      now.toLocaleDateString(),
      125,
      61
  );

  doc.text(
      now.toLocaleTimeString(),
      125,
      69
  );

  //----------------------------------------------------
  // Summary Title
  //----------------------------------------------------

  doc.setDrawColor(...GREEN);

  doc.line(
      14,
      95,
      pageWidth-14,
      95
  );

  doc.setFontSize(15);

  doc.setTextColor(...GREEN);

  doc.text(
      "Detection Summary",
      14,
      104
  );
  
//-----------------------------------------------------
// Summary Calculations
//-----------------------------------------------------

const totalItems = predictions.length;

const avgConfidence =
  totalItems > 0
    ? (
        predictions.reduce(
          (sum, item) => sum + item.confidence,
          0
        ) / totalItems
      ).toFixed(1)
    : "0.0";

const categories = [
  ...new Set(predictions.map(p => p.category))
];

const recyclableItems = predictions.filter(
  p => p.disposal.toLowerCase().includes("recycl")
).length;

const recyclablePercent =
  totalItems > 0
    ? Math.round((recyclableItems / totalItems) * 100)
    : 0;

//-----------------------------------------------------
// Summary Cards
//-----------------------------------------------------

const summaryStartY = 112;
const summaryCardWidth = 44;
const summaryCardHeight = 30;
const gap = 4;

const cards = [
  {
    title: "Items",
    value: totalItems
  },
  {
    title: "Avg Confidence",
    value: `${avgConfidence}%`
  },
  {
    title: "Categories",
    value: categories.length
  },
  {
    title: "Recyclable",
    value: `${recyclablePercent}%`
  }
];

cards.forEach((card, index) => {

  const x =
    14 +
    index * (summaryCardWidth + gap);

  doc.setFillColor(255,255,255);
  doc.setDrawColor(225,225,225);

  doc.roundedRect(
    x,
    summaryStartY,
    summaryCardWidth,
    summaryCardHeight,
    4,
    4,
    "FD"
  );

  doc.setFontSize(18);
  doc.setFont("helvetica","bold");
  doc.setTextColor(...GREEN);

  doc.text(
    String(card.value),
    x + summaryCardWidth/2,
    summaryStartY + 13,
    {align:"center"}
  );

  doc.setFontSize(10);
  doc.setFont("helvetica","normal");
  doc.setTextColor(80);

  doc.text(
    card.title,
    x + summaryCardWidth/2,
    summaryStartY + 23,
    {align:"center"}
  );

});

  //-----------------------------------------------------
// Detection Results Heading
//-----------------------------------------------------

const tableStartY =
    summaryStartY +
    summaryCardHeight +
    20;

doc.setDrawColor(...GREEN);

doc.line(
  14,
  tableStartY,
  pageWidth - 14,
  tableStartY
);

doc.setFontSize(15);
doc.setTextColor(...GREEN);
doc.setFont("helvetica", "bold");

doc.text(
  "Detection Results",
  14,
  tableStartY + 8
);

//-----------------------------------------------------
// Prepare Table Data
//-----------------------------------------------------

const body = predictions.map((item, index) => {

  const confidence = Number(item.confidence);

  let status = "Low";

  if (confidence >= 90)
      status = "High";
  else if (confidence >= 75)
      status = "Medium";

  return [

    index + 1,

    item.category,

    `${confidence.toFixed(1)}%`,

    status,

    item.disposal

  ];

});

//-----------------------------------------------------
// Table
//-----------------------------------------------------

autoTable(doc, {

  startY: tableStartY + 14,

  head: [[
    "#",
    "Waste",
    "Confidence",
    "Status",
    "Recommendation"
  ]],

  body,

  theme: "grid",

  styles: {

    fontSize: 10,

    cellPadding: 4,

    valign: "middle"

  },

  headStyles: {

    fillColor: GREEN,

    textColor: 255,

    halign: "center",

    fontStyle: "bold"

  },

  bodyStyles: {

    textColor: 40

  },

  alternateRowStyles: {

    fillColor: [248,250,248]

  },

  columnStyles: {

    0:{
      halign:"center",
      cellWidth:12
    },

    1:{
      cellWidth:42
    },

    2:{
      halign:"center",
      cellWidth:30
    },

    3:{
      halign:"center",
      cellWidth:28
    }

  },

  didParseCell: function(data){

      if(data.section==="body" && data.column.index===3){

          const status=data.cell.raw;

          if(status==="High"){

              data.cell.styles.fillColor=[220,252,231];
              data.cell.styles.textColor=[22,163,74];
              data.cell.styles.fontStyle="bold";

          }

          if(status==="Medium"){

              data.cell.styles.fillColor=[254,249,195];
              data.cell.styles.textColor=[202,138,4];
              data.cell.styles.fontStyle="bold";

          }

          if(status==="Low"){

              data.cell.styles.fillColor=[254,226,226];
              data.cell.styles.textColor=[220,38,38];
              data.cell.styles.fontStyle="bold";

          }

      }

  }

});

const finalY = doc.lastAutoTable.finalY;

doc.setFontSize(9);

doc.setTextColor(120);

doc.text(
    `Total detections : ${totalItems}`,
    14,
    finalY + 8
);

  //-----------------------------------------------------
// Images Section
//-----------------------------------------------------

let imageStartY = doc.lastAutoTable.finalY + 18;

// Move to next page if there isn't enough space
if (imageStartY + 95 > pageHeight - 25) {
  doc.addPage();
  imageStartY = 20;
}

doc.setDrawColor(...GREEN);

doc.line(
  14,
  imageStartY,
  pageWidth - 14,
  imageStartY
);

doc.setFontSize(15);
doc.setTextColor(...GREEN);
doc.setFont("helvetica", "bold");

doc.text(
  "Detection Images",
  14,
  imageStartY + 8
);

//-----------------------------------------------------
// Image Cards
//-----------------------------------------------------

const cardY = imageStartY + 14;

const imageCardWidth = 82;
const imageCardHeight = 82;

// Left Card
doc.setFillColor(255,255,255);
doc.setDrawColor(220,220,220);

doc.roundedRect(
  14,
  cardY,
  imageCardWidth,
  imageCardHeight,
  3,
  3,
  "FD"
);

// Right Card
doc.roundedRect(
  114,
  cardY,
  imageCardWidth,
  imageCardHeight,
  3,
  3,
  "FD"
);

// Titles

doc.setFontSize(11);
doc.setTextColor(...DARK);

doc.text(
  "Original Image",
  55,
  cardY + 7,
  { align: "center" }
);

doc.text(
  "Detection Result",
  155,
  cardY + 7,
  { align: "center" }
);

//-----------------------------------------------------
// Original Image
//-----------------------------------------------------

if (originalImage) {

  try {

    doc.addImage(
      originalImage,
      "JPEG",
      18,
      cardY + 12,
      74,
      62
    );

  } catch (err) {
    console.log(err);
  }

}

//-----------------------------------------------------
// Processed Image
//-----------------------------------------------------

if (processedImage) {

  try {

    doc.addImage(
      processedImage,
      "JPEG",
      118,
      cardY + 12,
      74,
      62
    );

  } catch (err) {
    console.log(err);
  }

}//-----------------------------------------------------
// Report Conclusion
//-----------------------------------------------------

const footerY = cardY + imageCardHeight + 18;

doc.setDrawColor(...GREEN);

doc.line(
  14,
  footerY,
  pageWidth - 14,
  footerY
);

doc.setFontSize(13);

doc.setTextColor(...GREEN);

doc.setFont("helvetica", "bold");

doc.text(
  "AI Recommendation",
  14,
  footerY + 10
);

doc.setFontSize(10);

doc.setFont("helvetica", "normal");

doc.setTextColor(70);

const recommendation =
  predictions.length > 0
    ? predictions[0].disposal
    : "No recommendation available.";

doc.text(
  recommendation,
  14,
  footerY + 18,
  {
    maxWidth: 180
  }
);
//-----------------------------------------------------
// Premium Footer
//-----------------------------------------------------

const footerHeight = pageHeight - 20;

doc.setDrawColor(...GREEN);

doc.line(
  14,
  footerHeight - 6,
  pageWidth - 14,
  footerHeight - 6
);

doc.setFontSize(12);

doc.setTextColor(...GREEN);

doc.setFont("helvetica", "bold");

doc.text(
  "Reduce • Reuse • Recycle",
  pageWidth / 2,
  footerHeight,
  {
    align: "center"
  }
);

doc.setFontSize(9);

doc.setFont("helvetica", "normal");

doc.setTextColor(120);

doc.text(
  "Generated by Smart Waste AI | AI Powered Waste Detection",
  pageWidth / 2,
  footerHeight + 6,
  {
    align: "center"
  }
);
 
  doc.save(
    `SmartWaste_Report_${Date.now()}.pdf`
  );
};

export default ReportPDF;