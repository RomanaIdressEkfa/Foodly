import { jsPDF } from 'jspdf';

const ORANGE = [239, 124, 79];
const OLIVE = [111, 122, 93];
const OLIVE_DARK = [93, 103, 80];
const INK = [32, 31, 26];
const MUTED = [124, 124, 108];
const CARD = [238, 240, 225];

const STATUS_FILL = { pending: [253, 230, 184], confirmed: [216, 230, 242], cancelled: [246, 212, 216] };
const STATUS_TEXT = { pending: [163, 118, 28], confirmed: [57, 97, 127], cancelled: [184, 74, 92] };

export function bookingRef(booking) {
  return booking._id.slice(-6).toUpperCase();
}

// A compact, receipt-sized page (not a half-empty A4 sheet) sized to fit
// exactly what this booking has to show.
const PAGE_WIDTH = 340;
const MARGIN = 28;
const HEADER_H = 84;
const ROW_H = 20;
const TOP_GAP = 30;
const HEAD_GAP = 18;
const SECTION_GAP = 16;
const SUBHEAD_GAP = 26;
const TOTAL_GAP = 14;
const FOOTER_GAP = 84;

function computeHeight(detailCount, itemCount) {
  let h = HEADER_H + TOP_GAP + HEAD_GAP + detailCount * ROW_H + SECTION_GAP + SUBHEAD_GAP;
  h += itemCount === 0 ? ROW_H : itemCount * ROW_H + TOTAL_GAP + ROW_H;
  return h + FOOTER_GAP;
}

// Builds a compact, branded invoice for a table booking and triggers a download.
export function downloadBookingInvoice(booking) {
  const details = [
    ['Name', booking.customerName],
    ['Phone', booking.phone],
    ...(booking.email ? [['Email', booking.email]] : []),
    ['Table', booking.tableName],
    ['Date', booking.date],
    ['Time', booking.time],
    ['Party size', `${booking.partySize} guest${booking.partySize > 1 ? 's' : ''}`],
  ];
  const hasItems = booking.items.length > 0;
  const height = computeHeight(details.length, booking.items.length);

  const doc = new jsPDF({ unit: 'pt', format: [PAGE_WIDTH, height] });
  const left = MARGIN;
  const right = PAGE_WIDTH - MARGIN;
  let y;

  // Header band with a small logo badge, matching the site's olive/orange palette.
  doc.setFillColor(...OLIVE);
  doc.rect(0, 0, PAGE_WIDTH, HEADER_H, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(left + 13, 30, 13, 'F');
  doc.setTextColor(...OLIVE_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('F', left + 13, 34.5, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Foodly', left + 32, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Table Reservation Invoice', left + 32, 48);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`#${bookingRef(booking)}`, right, 28, { align: 'right' });

  const pillW = 72, pillH = 16;
  const pillFill = STATUS_FILL[booking.status] || STATUS_FILL.pending;
  const pillText = STATUS_TEXT[booking.status] || STATUS_TEXT.pending;
  doc.setFillColor(...pillFill);
  doc.roundedRect(right - pillW, 38, pillW, pillH, 8, 8, 'F');
  doc.setTextColor(...pillText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(booking.status.toUpperCase(), right - pillW / 2, 48.5, { align: 'center' });

  y = HEADER_H + TOP_GAP;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Reservation details', left, y);
  y += HEAD_GAP;

  doc.setFontSize(10.5);
  details.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...CARD);
      doc.rect(left - 10, y - 13.5, (right - left) + 20, ROW_H, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(label, left, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(String(value), right, y, { align: 'right' });
    y += ROW_H;
  });

  y += SECTION_GAP;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Pre-ordered items', left, y);
  y += 8;
  doc.setDrawColor(228, 221, 203);
  doc.line(left, y, right, y);
  y += SUBHEAD_GAP - 8;

  doc.setFontSize(10.5);
  if (!hasItems) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('No pre-order — you will order at the restaurant.', left, y);
    y += ROW_H;
  } else {
    booking.items.forEach((item) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.text(`${item.name}  ×${item.qty}`, left, y);
      doc.text(`${(item.price * item.qty).toFixed(2)}$`, right, y, { align: 'right' });
      y += ROW_H;
    });
    doc.setDrawColor(228, 221, 203);
    doc.line(left, y - 6, right, y - 6);
    y += TOTAL_GAP;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text('Total', left, y);
    doc.setTextColor(...ORANGE);
    doc.text(`${booking.total.toFixed(2)}$`, right, y, { align: 'right' });
    y += ROW_H;
  }

  const footerY = y + 30;
  doc.setDrawColor(228, 221, 203);
  doc.line(left, footerY, right, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Please show this invoice when you arrive at the restaurant.', PAGE_WIDTH / 2, footerY + 20, { align: 'center' });
  doc.text(`Booked on ${new Date(booking.createdAt).toLocaleString()}`, PAGE_WIDTH / 2, footerY + 34, { align: 'center' });

  doc.save(`foodly-booking-${bookingRef(booking)}.pdf`);
}
