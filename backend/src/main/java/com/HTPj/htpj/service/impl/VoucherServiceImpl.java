package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.BookingRepository;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.VoucherService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.BaseFont;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoucherServiceImpl implements VoucherService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD);
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY);
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);

    @Override
    public byte[] generateVoucherPdf(String bookingCode) {
        String userId = extractUserId();
        Users user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Agency agency = user.getAgency();
        if (agency == null) {
            throw new AppException(ErrorCode.AGENCY_NOT_FOUND);
        }

        Booking booking = bookingRepository.findDetailByBookingCodeAndUserId(bookingCode, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // BR-DOC-02: Only BOOKED or CANCELLED bookings can have vouchers
        boolean isCancelled = "CANCELLED".equalsIgnoreCase(booking.getBookingStatus());
        if (!"BOOKED".equalsIgnoreCase(booking.getBookingStatus()) && !isCancelled) {
            throw new AppException(ErrorCode.VOUCHER_NOT_AVAILABLE);
        }

        Hotel hotel = hotelRepository.findById(booking.getHotelId()).orElse(null);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // --- Title ---
            Paragraph title = new Paragraph("BOOKING CONFIRMATION VOUCHER", TITLE_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // --- Booking Reference ---
            Paragraph refParagraph = new Paragraph("Booking Code: " + booking.getBookingCode(), HEADER_FONT);
            refParagraph.setAlignment(Element.ALIGN_CENTER);
            document.add(refParagraph);

            Paragraph dateParagraph = new Paragraph(
                    "Issued: " + booking.getCreatedAt().format(DATETIME_FMT), SMALL_FONT);
            dateParagraph.setAlignment(Element.ALIGN_CENTER);
            document.add(dateParagraph);
            document.add(new Paragraph(" "));

            // --- Hotel Information ---
            document.add(new Paragraph("Hotel Information", HEADER_FONT));
            addLine(document);
            if (hotel != null) {
                addField(document, "Hotel Name", hotel.getHotelName());
                addField(document, "Address", hotel.getAddress());
                if (hotel.getCity() != null) {
                    addField(document, "City", hotel.getCity());
                }
                if (hotel.getPhone() != null) {
                    addField(document, "Phone", hotel.getPhone());
                }
                if (hotel.getStarRating() != null) {
                    addField(document, "Star Rating", hotel.getStarRating() + " Stars");
                }
            }
            document.add(new Paragraph(" "));

            // --- Guest Information ---
            document.add(new Paragraph("Guest Information", HEADER_FONT));
            addLine(document);
            addField(document, "Guest Name", booking.getGuestName());
            if (booking.getGuestPhone() != null) {
                addField(document, "Phone", booking.getGuestPhone());
            }
            if (booking.getGuestEmail() != null) {
                addField(document, "Email", booking.getGuestEmail());
            }
            document.add(new Paragraph(" "));

            // --- Stay Details ---
            document.add(new Paragraph("Stay Details", HEADER_FONT));
            addLine(document);
            addField(document, "Check-in", booking.getCheckInDate().format(DATE_FMT));
            addField(document, "Check-out", booking.getCheckOutDate().format(DATE_FMT));
            addField(document, "Nights", String.valueOf(booking.getNights()));
            addField(document, "Total Rooms", String.valueOf(booking.getTotalRooms()));
            if (booking.getTotalGuests() != null) {
                addField(document, "Total Guests", String.valueOf(booking.getTotalGuests()));
            }
            document.add(new Paragraph(" "));

            // --- Room Details Table (NO PRICES - protects agency margin) ---
            document.add(new Paragraph("Room Details", HEADER_FONT));
            addLine(document);

            if (booking.getBookingDetails() != null && !booking.getBookingDetails().isEmpty()) {
                PdfPTable roomTable = new PdfPTable(5);
                roomTable.setWidthPercentage(100);
                roomTable.setWidths(new float[]{3f, 1.5f, 1.5f, 2f, 2f});

                addTableHeader(roomTable, "Room Type", "Qty", "Nights", "Bed Type", "Max Guests");

                for (BookingDetail bd : booking.getBookingDetails()) {
                    roomTable.addCell(createCell(bd.getRoomTitle()));
                    roomTable.addCell(createCell(String.valueOf(bd.getQuantity())));
                    roomTable.addCell(createCell(String.valueOf(bd.getNights())));
                    roomTable.addCell(createCell(bd.getBedType() != null ? bd.getBedType() : "-"));
                    String maxGuests = ((bd.getMaxAdults() != null ? bd.getMaxAdults() : 0)
                            + (bd.getMaxChildren() != null ? bd.getMaxChildren() : 0)) + " pax";
                    roomTable.addCell(createCell(maxGuests));
                }

                document.add(roomTable);
            }

            document.add(new Paragraph(" "));

            // --- Special Notes ---
            if (booking.getNotes() != null && !booking.getNotes().isBlank()) {
                document.add(new Paragraph("Special Requests", HEADER_FONT));
                addLine(document);
                document.add(new Paragraph(booking.getNotes(), NORMAL_FONT));
                document.add(new Paragraph(" "));
            }

            // --- Agency Information ---
            document.add(new Paragraph("Booked By", HEADER_FONT));
            addLine(document);
            addField(document, "Agency", agency.getAgencyName());
            if (agency.getContactPhone() != null) {
                addField(document, "Agency Phone", agency.getContactPhone());
            }
            document.add(new Paragraph(" "));

            // --- Footer ---
            Paragraph footer = new Paragraph(
                    "This voucher confirms the reservation. Please present it at the hotel reception upon check-in.",
                    SMALL_FONT);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            // --- CANCELLED watermark (BR-DOC-02) ---
            if (isCancelled) {
                PdfContentByte canvas = writer.getDirectContentUnder();
                canvas.saveState();
                canvas.setColorFill(new Color(255, 0, 0, 40));
                BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, false);
                canvas.beginText();
                canvas.setFontAndSize(bf, 80);
                canvas.showTextAligned(Element.ALIGN_CENTER, "CANCELLED / VOID",
                        PageSize.A4.getWidth() / 2, PageSize.A4.getHeight() / 2, 45);
                canvas.endText();
                canvas.restoreState();
            }

            document.close();
            return out.toByteArray();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.VOUCHER_GENERATION_FAILED);
        }
    }

    @Override
    public String getVoucherFileName(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        String guestName = booking.getGuestName() != null
                ? booking.getGuestName().replaceAll("[^a-zA-Z0-9]", "_")
                : "Guest";

        return "Voucher_" + bookingCode + "_" + guestName + ".pdf";
    }

    private void addField(Document document, String label, String value) throws DocumentException {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + ": ", LABEL_FONT));
        p.add(new Chunk(value != null ? value : "-", NORMAL_FONT));
        document.add(p);
    }

    private void addLine(Document document) throws DocumentException {
        Paragraph line = new Paragraph("______________________________________________", SMALL_FONT);
        document.add(line);
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        Font font = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, font));
            cell.setBackgroundColor(new Color(51, 51, 51));
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private PdfPCell createCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setPadding(4);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    public String extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) auth.getPrincipal();
        return jwt.getSubject();
    }
}
