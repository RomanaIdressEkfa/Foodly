import { jsPDF } from 'jspdf';

const ORANGE = [239, 124, 79];
const INK = [32, 31, 26];
const MUTED = [124, 124, 108];

export function bookingRef(booking) {
  return booking._id.slice(-6).toUpperCase();
}

// Builds a one-page invoice for a table booking and triggers a download.
export function downloadBookingInvoice(booking) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 48;
  const right = pageWidth - 48;
  let y = 0;

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('FOODLY', left, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Table Reservation Invoice', left, 72);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`#${bookingRef(booking)}`, right, 52, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Status: ${booking.status}`, right, 72, { align: 'right' });

  y = 130;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Reservation details', left, y);
  y += 22;

  const details = [
    ['Name', booking.customerName],
    ['Phone', booking.phone],
    ...(booking.email ? [['Email', booking.email]] : []),
    ['Table', booking.tableName],
    ['Date', booking.date],
    ['Time', booking.time],
    ['Party size', `${booking.partySize} guest${booking.partySize > 1 ? 's' : ''}`],
  ];
  doc.setFontSize(11);
  for (const [label, value] of details) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(label, left, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(String(value), right, y, { align: 'right' });
    y += 20;
  }

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Pre-ordered items', left, y);
  y += 10;
  doc.setDrawColor(228, 221, 203);
  doc.line(left, y, right, y);
  y += 20;

  doc.setFontSize(11);
  if (booking.items.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('No pre-order — you will order at the restaurant.', left, y);
    y += 20;
  } else {
    for (const item of booking.items) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.text(`${item.name}  x${item.qty}`, left, y);
      doc.text(`${(item.price * item.qty).toFixed(2)}$`, right, y, { align: 'right' });
      y += 20;
    }
    doc.line(left, y - 6, right, y - 6);
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Total', left, y);
    doc.setTextColor(...ORANGE);
    doc.text(`${booking.total.toFixed(2)}$`, right, y, { align: 'right' });
    y += 20;
  }

  y += 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Please show this invoice when you arrive at the restaurant.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Booked on ${new Date(booking.createdAt).toLocaleString()}`, pageWidth / 2, y + 16, { align: 'center' });

  doc.save(`foodly-booking-${bookingRef(booking)}.pdf`);
}
