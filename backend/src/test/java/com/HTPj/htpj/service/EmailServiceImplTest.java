//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.service.impl.EmailServiceImpl;
//import jakarta.mail.internet.MimeMessage;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.thymeleaf.TemplateEngine;
//import org.thymeleaf.context.Context;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//import static org.junit.Assert.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class EmailServiceImplTest {
//
//    @Mock
//    private JavaMailSender mailSender;
//
//    @Mock
//    private TemplateEngine templateEngine;
//
//    @InjectMocks
//    private EmailServiceImpl emailService;
//
//    @Test
//    void sendWelcomeOnboardEmail_Success() {
//        String to = "test@example.com";
//        MimeMessage mimeMessage = mock(MimeMessage.class);
//
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        when(templateEngine.process(eq("welcome-onboard"), any(Context.class)))
//                .thenReturn("<html>Welcome</html>");
//
//
//        emailService.sendWelcomeOnboardEmail(to);
//
//        verify(mailSender, times(1)).send(mimeMessage);
//        verify(templateEngine, times(1)).process(eq("welcome-onboard"), any(Context.class));
//    }
//
//    @Test
//    void sendWelcomeOnboardEmail_Exception_ShouldNotThrow() {
//        String to = "error@example.com";
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail server down"));
//
//
//        emailService.sendWelcomeOnboardEmail(to);
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//    @Test
//    void sendOtpEmail_Success() throws Exception {
//        String to = "user@example.com";
//        String otp = "123456";
//        String username = "BinhNguyen";
//        MimeMessage mimeMessage = mock(MimeMessage.class);
//
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//
//        emailService.sendOtpEmail(to, otp, username);
//
//        verify(mailSender, times(1)).send(mimeMessage);
//    }
//
//
//    @Test
//    void sendOtpEmail_ShouldContainCorrectContent() throws Exception {
//        String to = "user@example.com";
//        String otp = "999888";
//        String username = "BinhNguyen";
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendOtpEmail(to, otp, username);
//
//        verify(mailSender).send(messageCaptor.capture());
//        MimeMessage capturedMessage = messageCaptor.getValue();
//
//        String htmlResult = getTextFromMimePart(capturedMessage);
//
//        assertThat(htmlResult).contains(otp);
//        assertThat(htmlResult).contains("Xin chào " + username);
//    }
//
//    private String getTextFromMimePart(jakarta.mail.Part part) throws Exception {
//        Object content = part.getContent();
//
//        if (content instanceof String) {
//            return (String) content;
//        }
//
//        if (content instanceof jakarta.mail.internet.MimeMultipart) {
//            jakarta.mail.internet.MimeMultipart multipart = (jakarta.mail.internet.MimeMultipart) content;
//            StringBuilder result = new StringBuilder();
//
//            for (int i = 0; i < multipart.getCount(); i++) {
//                result.append(getTextFromMimePart(multipart.getBodyPart(i)));
//            }
//            return result.toString();
//        }
//
//        return "";
//    }
//    @Test
//    void sendOtpEmail_Exception_ShouldNotThrow() {
//        String to = "user@example.com";
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("SMTP Error"));
//
//        emailService.sendOtpEmail(to, "123456", "user");
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//
//    @Test
//    void sendResetPasswordEmail_ShouldContainCorrectLinkAndUser() throws Exception {
//        String to = "user@example.com";
//        String resetLink = "https://hms.com/reset-password?token=secret123";
//        String username = "NguyenBinh";
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendResetPasswordEmail(to, resetLink, username);
//
//        verify(mailSender).send(messageCaptor.capture());
//        MimeMessage capturedMessage = messageCaptor.getValue();
//
//        String htmlResult = getTextFromMimePart(capturedMessage);
//
//        assertThat(htmlResult).contains(username);
//        assertThat(htmlResult).contains(resetLink);
//        assertThat(htmlResult).contains("Đặt lại mật khẩu");
//        assertThat(htmlResult).contains("15 phút");
//    }
//
//    @Test
//    void sendResetPasswordEmail_Exception_ShouldNotThrow() {
//        String to = "user@example.com";
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail service failure"));
//
//        emailService.sendResetPasswordEmail(to, "http://link.com", "user");
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//
//    @Test
//    void sendNewReviewNotification_Success_3Stars() throws Exception {
//        String to = "manager@hotel.com";
//        String hotelName = "Grand Plaza";
//        String agencyName = "Traveloka";
//        String bookingCode = "BK-789";
//        int ratingScore = 3;
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendNewReviewNotification(to, hotelName, agencyName, ratingScore, bookingCode);
//
//        verify(mailSender).send(messageCaptor.capture());
//        String htmlResult = getTextFromMimePart(messageCaptor.getValue());
//
//        assertThat(htmlResult).contains(hotelName);
//        assertThat(htmlResult).contains(agencyName);
//        assertThat(htmlResult).contains(bookingCode);
//
//
//        assertThat(htmlResult).contains("\u2605\u2605\u2605\u2606\u2606");
//        assertThat(htmlResult).contains("3/5");
//    }
//
//    @Test
//    void sendNewReviewNotification_Success_5Stars() throws Exception {
//        int ratingScore = 5;
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendNewReviewNotification("test@test.com", "Hotel", "Agency", ratingScore, "BC");
//
//        verify(mailSender).send(messageCaptor.capture());
//        String htmlResult = getTextFromMimePart(messageCaptor.getValue());
//
//        assertThat(htmlResult).contains("\u2605\u2605\u2605\u2605\u2605");
//        assertThat(htmlResult).doesNotContain("\u2606");
//    }
//
//    @Test
//    void sendNewReviewNotification_Exception_ShouldNotThrow() {
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Error"));
//
//
//        emailService.sendNewReviewNotification("to", "h", "a", 5, "b");
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//    @Test
//    void sendPasswordChangedNotification_Success() throws Exception {
//        String to = "user@example.com";
//        String username = "BinhNguyen";
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendPasswordChangedNotification(to, username);
//
//        verify(mailSender).send(messageCaptor.capture());
//        String htmlResult = getTextFromMimePart(messageCaptor.getValue());
//
//        assertThat(htmlResult).contains("Xin chào " + username);
//        assertThat(htmlResult).contains("Mật khẩu tài khoản HMS của bạn vừa được thay đổi");
//        assertThat(htmlResult).contains("liên hệ với chúng tôi ngay lập tức");
//    }
//
//    @Test
//    void sendPasswordChangedNotification_Exception_ShouldNotThrow() {
//        String to = "error@example.com";
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("SMTP Server Down"));
//
//
//        emailService.sendPasswordChangedNotification(to, "user");
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//
//    @Test
//    void sendStaffAccountEmail_Success() throws Exception {
//        String to = "staff@hotel.com";
//        String username = "staff_member";
//        String password = "TemporaryPassword123";
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendStaffAccountEmail(to, username, password);
//
//        verify(mailSender).send(messageCaptor.capture());
//        String htmlResult = getTextFromMimePart(messageCaptor.getValue());
//
//        assertThat(htmlResult).contains("Tên tài khoản:</b> " + username);
//        assertThat(htmlResult).contains("Mật khẩu tạm thời:</b> " + password);
//
//        assertThat(htmlResult).contains("HMS - BookingSphere");
//        assertThat(htmlResult).contains("vui lòng đổi mật khẩu ngay sau khi đăng nhập");
//
//        assertThat(messageCaptor.getValue().getFrom()[0].toString()).contains("bookingsphere@gmail.com");
//    }
//
//    @Test
//    void sendStaffAccountEmail_Exception_ShouldNotThrow() {
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("SMTP Server Offline"));
//
//        emailService.sendStaffAccountEmail("test@test.com", "user", "pass");
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//
//    @Test
//    void sendPayoutStatementNotification_Success() throws Exception {
//        String to = "finance@hotel.com";
//        String hotelName = "Luxury Stay Hotel";
//        String statementCode = "PAY-2026-001";
//        LocalDate start = LocalDate.of(2026, 4, 1);
//        LocalDate end = LocalDate.of(2026, 4, 15);
//        BigDecimal gross = new BigDecimal("10000000");
//        BigDecimal comm = new BigDecimal("1000000");
//        BigDecimal net = new BigDecimal("9000000");
//        Integer bookings = 15;
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendPayoutStatementNotification(to, hotelName, statementCode, start, end, gross, comm, net, bookings);
//
//        verify(mailSender).send(messageCaptor.capture());
//        String htmlResult = getTextFromMimePart(messageCaptor.getValue());
//
//        assertThat(htmlResult).contains("01/04/2026 - 15/04/2026");
//
//        assertThat(htmlResult).contains(hotelName);
//        assertThat(htmlResult).contains(statementCode);
//        assertThat(htmlResult).contains(bookings.toString());
//
//
//        assertThat(htmlResult).contains(statementCode);
//        assertThat(htmlResult).contains("Thanh toán thực nhận");
//    }
//
//    @Test
//    void sendPayoutStatementNotification_Exception_ShouldNotThrow() {
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail server error"));
//
//        emailService.sendPayoutStatementNotification("to", "h", "c", LocalDate.now(), LocalDate.now(),
//                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0);
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//
//    @Test
//    void sendPaymentSentNotification_Success() throws Exception {
//        String to = "finance@hotel.com";
//        String hotelName = "Ocean View Resort";
//        String statementCode = "PAY-2026-005";
//        BigDecimal netPayout = new BigDecimal("15000000");
//        String bankReference = "FT261058899221";
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendPaymentSentNotification(to, hotelName, statementCode, netPayout, bankReference);
//
//        verify(mailSender).send(messageCaptor.capture());
//        String htmlResult = getTextFromMimePart(messageCaptor.getValue());
//
//        assertThat(htmlResult).contains(hotelName);
//        assertThat(htmlResult).contains(statementCode);
//        assertThat(htmlResult).contains(bankReference);
//
//        assertThat(htmlResult).contains("đã được chuyển thành công");
//        assertThat(htmlResult).contains("Xác nhận thanh toán");
//    }
//
//    @Test
//    void sendPaymentSentNotification_Exception_ShouldNotThrow() {
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Network Error"));
//
//        emailService.sendPaymentSentNotification("to", "hotel", "code", BigDecimal.ZERO, "ref");
//
//        verify(mailSender, never()).send(any(MimeMessage.class));
//    }
//
//    @Test
//    void sendSupportFormEmail_Success() throws Exception {
//        String toSupport = "support@hms.com";
//        String guestName = "Nguyen Van A";
//        String guestEmail = "guest@gmail.com";
//        String guestPhone = "0909123456";
//        String subject = "Lỗi đặt phòng";
//        String content = "Tôi không thể thanh toán được.";
//
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendSupportFormEmail(toSupport, guestName, guestEmail, guestPhone, subject, content);
//
//        verify(mailSender).send(messageCaptor.capture());
//        MimeMessage capturedMessage = messageCaptor.getValue();
//
//        assertThat(capturedMessage.getReplyTo()[0].toString()).contains(guestEmail);
//
//        String htmlResult = getTextFromMimePart(capturedMessage);
//
//        assertThat(htmlResult).contains(guestName);
//        assertThat(htmlResult).contains(guestPhone);
//        assertThat(htmlResult).contains(content);
//    }
//
//    @Test
//    void sendSupportFormEmail_PhoneBlank_ShouldShowDefaultText() throws Exception {
//        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
//        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
//        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
//
//        emailService.sendSupportFormEmail("to@hms.com", "Name", "e@e.com", "", "Sub", "Msg");
//
//        verify(mailSender).send(messageCaptor.capture());
//        String htmlResult = getTextFromMimePart(messageCaptor.getValue());
//        assertThat(htmlResult).contains("Không cung cấp");
//    }
//
//    @Test
//    void sendSupportFormEmail_Exception_ShouldThrowRuntimeException() {
//
//        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail server down"));
//
//
//        assertThrows(RuntimeException.class, () -> {
//            emailService.sendSupportFormEmail("to@hms.com", "G", "E", "P", "S", "C");
//        });
//    }
//}