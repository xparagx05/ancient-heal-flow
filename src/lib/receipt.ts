import { jsPDF } from "jspdf";

export type ReceiptData = {
  kind: "appointment" | "subscription";
  receiptId: string;
  paymentId?: string;
  orderId?: string;
  name?: string;
  email?: string;
  phone?: string;
  itemTitle: string;      // e.g., "Consultation with Dr. Priya Sharma" or "Pro Plan"
  itemSubtitle?: string;  // specialty / plan tagline
  date?: string;
  time?: string;
  amount: number;         // rupees
  issuedAt?: string;      // ISO
};

export function downloadReceiptPDF(d: ReceiptData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(15, 23, 42); // navy
  doc.rect(0, 0, W, 110, "F");
  doc.setTextColor(201, 162, 74); // gold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Dhanvantara AI", 40, 55);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Ancient healing • Modern intelligence", 40, 78);
  doc.setFontSize(10);
  doc.text("Official Receipt", W - 40, 55, { align: "right" });
  doc.setFontSize(9);
  doc.text(new Date(d.issuedAt || Date.now()).toLocaleString(), W - 40, 72, { align: "right" });

  // Body
  doc.setTextColor(30, 30, 30);
  let y = 150;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(d.kind === "subscription" ? "Subscription Receipt" : "Appointment Receipt", 40, y);
  y += 8;
  doc.setDrawColor(201, 162, 74);
  doc.setLineWidth(1);
  doc.line(40, y, W - 40, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const row = (label: string, value: string) => {
    doc.setTextColor(120, 120, 120);
    doc.text(label, 40, y);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text(value, 220, y);
    doc.setFont("helvetica", "normal");
    y += 22;
  };

  row("Receipt ID", d.receiptId);
  if (d.orderId) row("Order ID", d.orderId);
  if (d.paymentId) row("Payment ID", d.paymentId);
  if (d.name) row("Name", d.name);
  if (d.email) row("Email", d.email);
  if (d.phone) row("Phone", d.phone);

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(40, y, W - 40, y);
  y += 22;

  row(d.kind === "subscription" ? "Plan" : "Doctor", d.itemTitle);
  if (d.itemSubtitle) row(d.kind === "subscription" ? "Details" : "Specialty", d.itemSubtitle);
  if (d.date) row("Date", d.date);
  if (d.time) row("Time", d.time);

  y += 8;
  doc.setDrawColor(201, 162, 74);
  doc.line(40, y, W - 40, y);
  y += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Amount Paid", 40, y);
  doc.setTextColor(201, 130, 40);
  doc.setFontSize(20);
  doc.text(`₹ ${d.amount.toLocaleString("en-IN")}`, W - 40, y, { align: "right" });

  y += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Thank you for trusting Dhanvantara AI with your care. This is a system-generated\nreceipt of a successful payment processed via Razorpay.",
    40,
    y
  );

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text("Support: hellodhanvantara.ai@gmail.com  •  +91 99758 03340", 40, 800);
  doc.text("Dhanvantara AI • Mumbai, Bharat 🇮🇳", W - 40, 800, { align: "right" });

  doc.save(`Dhanvantara-Receipt-${d.receiptId}.pdf`);
}
