package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Override
    public void sendWelcomeOnboardEmail(String to) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Welcome to HMS");
            Context context = new Context();
            String htmlContent = templateEngine.process("welcome-onboard", context);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}", to, e);
        }
    }

    @Override
    public void sendOtpEmail(String to, String otp, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("HMS - Mã xác thực OTP của bạn");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                    + "<div style='background: linear-gradient(135deg, #10b981, #14b8a6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 24px;'>HMS - BookingSphere</h1>"
                    + "</div>"
                    + "<div style='background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;'>"
                    + "<h2 style='color: #1e293b; margin-top: 0;'>Xin chào " + username + ",</h2>"
                    + "<p style='color: #475569; line-height: 1.6;'>Mã xác thực OTP của bạn là:</p>"
                    + "<div style='text-align: center; margin: 24px 0;'>"
                    + "<span style='font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981; background: #f0fdf4; padding: 16px 32px; border-radius: 12px; border: 2px dashed #10b981;'>"
                    + otp + "</span></div>"
                    + "<p style='color: #475569; line-height: 1.6;'>Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>"
                    + "<p style='color: #94a3b8; font-size: 13px; margin-top: 24px;'>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
        }
    }

    @Override
    public void sendResetPasswordEmail(String to, String resetLink, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("HMS - Đặt lại mật khẩu");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                    + "<div style='background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 24px;'>HMS - BookingSphere</h1>"
                    + "</div>"
                    + "<div style='background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;'>"
                    + "<h2 style='color: #1e293b; margin-top: 0;'>Xin chào " + username + ",</h2>"
                    + "<p style='color: #475569; line-height: 1.6;'>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>"
                    + "<div style='text-align: center; margin: 24px 0;'>"
                    + "<a href='" + resetLink + "' style='display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 16px;'>Đặt lại mật khẩu</a>"
                    + "</div>"
                    + "<p style='color: #475569; line-height: 1.6;'>Liên kết sẽ hết hạn sau <strong>15 phút</strong>.</p>"
                    + "<p style='color: #94a3b8; font-size: 13px; margin-top: 24px;'>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}", to, e);
        }
    }

    @Override
    public void sendNewReviewNotification(String to, String hotelName, String agencyName, int ratingScore, String bookingCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("HMS - Đánh giá mới cho " + hotelName);

            StringBuilder stars = new StringBuilder();
            for (int i = 0; i < ratingScore; i++) stars.append("\u2605");
            for (int i = ratingScore; i < 5; i++) stars.append("\u2606");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                    + "<div style='background: linear-gradient(135deg, #10b981, #14b8a6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 24px;'>HMS - BookingSphere</h1>"
                    + "</div>"
                    + "<div style='background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;'>"
                    + "<h2 style='color: #1e293b; margin-top: 0;'>Đánh giá mới cho " + hotelName + "</h2>"
                    + "<p style='color: #475569; line-height: 1.6;'>Đại lý <strong>" + agencyName + "</strong> vừa gửi đánh giá cho đơn đặt phòng <strong>#" + bookingCode + "</strong>.</p>"
                    + "<div style='text-align: center; margin: 24px 0;'>"
                    + "<span style='font-size: 32px; color: #f59e0b;'>" + stars + "</span>"
                    + "<p style='color: #64748b; font-size: 14px; margin-top: 4px;'>" + ratingScore + "/5</p>"
                    + "</div>"
                    + "<p style='color: #475569; line-height: 1.6;'>Hãy đăng nhập vào hệ thống để xem chi tiết và phản hồi đánh giá.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("New review notification sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send new review notification to {}", to, e);
        }
    }

    @Override
    public void sendPasswordChangedNotification(String to, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("HMS - Mật khẩu đã được thay đổi");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                    + "<div style='background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 24px;'>HMS - BookingSphere</h1>"
                    + "</div>"
                    + "<div style='background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;'>"
                    + "<h2 style='color: #1e293b; margin-top: 0;'>Xin chào " + username + ",</h2>"
                    + "<p style='color: #475569; line-height: 1.6;'>Mật khẩu tài khoản HMS của bạn vừa được thay đổi thành công.</p>"
                    + "<p style='color: #475569; line-height: 1.6;'>Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password changed notification to {}", to, e);
        }
    }

    @Override
    public void sendStaffAccountEmail(String to, String username, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("bookingsphere@gmail.com");
            helper.setTo(to);
            helper.setSubject("HMS - Tài khoản nhân viên đã được tạo");

            String htmlContent =
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;'>"

                            + "<div style='background: linear-gradient(135deg,#10b981,#14b8a6); padding: 30px; border-radius: 16px 16px 0 0; text-align:center;'>"
                            + "<h1 style='color:white;margin:0;'>HMS - BookingSphere</h1>"
                            + "</div>"

                            + "<div style='background:white;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 16px 16px;'>"

                            + "<h2>Chào mừng bạn đến với HMS!</h2>"

                            + "<p>Tài khoản nhân viên của bạn đã được tạo thành công.</p>"

                            + "<div style='background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;'>"
                            + "<p><b>Tên tài khoản:</b> " + username + "</p>"
                            + "<p><b>Mật khẩu tạm thời:</b> " + password + "</p>"
                            + "</div>"

                            + "<p style='color:#ef4444;'><b>Vì lý do bảo mật, vui lòng đổi mật khẩu ngay sau khi đăng nhập.</b></p>"

                            + "<p>Bạn có thể đăng nhập vào hệ thống HMS để bắt đầu làm việc.</p>"

                            + "<p style='color:#64748b;font-size:13px;margin-top:20px;'>"
                            + "Nếu bạn không yêu cầu tạo tài khoản này, vui lòng liên hệ quản trị viên hệ thống."
                            + "</p>"

                            + "</div></div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

            log.info("Staff account email sent to {}", to);

        } catch (Exception e) {
            log.error("Failed to send staff account email to {}", to, e);
        }
    }

    @Override
    public void sendPayoutStatementNotification(String to, String hotelName, String statementCode,
                                                LocalDate periodStart, LocalDate periodEnd,
                                                BigDecimal grossRevenue, BigDecimal totalCommission,
                                                BigDecimal netPayout, Integer totalBookings) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("HMS - Bảng sao kê thanh toán " + statementCode);

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String period = periodStart.format(fmt) + " - " + periodEnd.format(fmt);

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                    + "<div style='background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 24px;'>HMS - BookingSphere</h1>"
                    + "<p style='color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;'>Payout Statement</p>"
                    + "</div>"
                    + "<div style='background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;'>"
                    + "<h2 style='color: #1e293b; margin-top: 0;'>Xin chào " + hotelName + ",</h2>"
                    + "<p style='color: #475569; line-height: 1.6;'>Bảng sao kê thanh toán cho kỳ <strong>" + period + "</strong> đã được tạo.</p>"
                    + "<div style='background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;'>"
                    + "<table style='width: 100%; border-collapse: collapse;'>"
                    + "<tr><td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Mã sao kê:</td>"
                    + "<td style='padding: 8px 0; text-align: right; font-weight: bold; color: #1e293b;'>" + statementCode + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Kỳ sao kê:</td>"
                    + "<td style='padding: 8px 0; text-align: right; font-weight: bold; color: #1e293b;'>" + period + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Tổng số booking:</td>"
                    + "<td style='padding: 8px 0; text-align: right; font-weight: bold; color: #1e293b;'>" + totalBookings + "</td></tr>"
                    + "<tr style='border-top: 1px solid #e2e8f0;'><td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Doanh thu gộp:</td>"
                    + "<td style='padding: 8px 0; text-align: right; font-weight: bold; color: #1e293b;'>" + formatCurrency(grossRevenue) + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Hoa hồng sàn:</td>"
                    + "<td style='padding: 8px 0; text-align: right; font-weight: bold; color: #ef4444;'>-" + formatCurrency(totalCommission) + "</td></tr>"
                    + "<tr style='border-top: 2px solid #3b82f6;'><td style='padding: 12px 0; color: #1e293b; font-size: 16px; font-weight: bold;'>Thanh toán thực nhận:</td>"
                    + "<td style='padding: 12px 0; text-align: right; font-weight: bold; color: #3b82f6; font-size: 18px;'>" + formatCurrency(netPayout) + "</td></tr>"
                    + "</table></div>"
                    + "<p style='color: #475569; line-height: 1.6;'>Vui lòng đăng nhập vào hệ thống để xem chi tiết và xác nhận bảng sao kê.</p>"
                    + "<div style='text-align: center; margin: 24px 0;'>"
                    + "<a href='https://www.hmsb2b.site/hotel/payout-state' style='display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 14px;'>Xem chi tiết sao kê</a>"
                    + "</div>"
                    + "<p style='color: #94a3b8; font-size: 12px; margin-top: 24px;'>Đây là email tự động từ hệ thống HMS.Vui lòng không trả lời lại email này.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Payout statement notification sent to {} for statement {}", to, statementCode);
        } catch (Exception e) {
            log.error("Failed to send payout statement notification to {}", to, e);
        }
    }

    @Override
    public void sendPaymentSentNotification(String to, String hotelName, String statementCode,
                                            BigDecimal netPayout, String bankReference) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("HMS - Thanh toán đã được chuyển " + statementCode);

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                    + "<div style='background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 24px;'>HMS - BookingSphere</h1>"
                    + "<p style='color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;'>Xác nhận thanh toán</p>"
                    + "</div>"
                    + "<div style='background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;'>"
                    + "<h2 style='color: #1e293b; margin-top: 0;'>Xin chào " + hotelName + ",</h2>"
                    + "<p style='color: #475569; line-height: 1.6;'>Chúng tôi xin thông báo rằng khoản thanh toán cho bảng sao kê <strong>" + statementCode + "</strong> đã được chuyển thành công.</p>"
                    + "<div style='background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #bbf7d0;'>"
                    + "<table style='width: 100%; border-collapse: collapse;'>"
                    + "<tr><td style='padding: 8px 0; color: #64748b;'>Số tiền:</td>"
                    + "<td style='padding: 8px 0; text-align: right; font-weight: bold; color: #10b981; font-size: 18px;'>" + formatCurrency(netPayout) + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #64748b;'>Mã giao dịch ngân hàng:</td>"
                    + "<td style='padding: 8px 0; text-align: right; font-weight: bold; color: #1e293b;'>" + bankReference + "</td></tr>"
                    + "</table></div>"
                    + "<p style='color: #94a3b8; font-size: 12px; margin-top: 24px;'>Đây là email tự động từ hệ thống HMS.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Payment sent notification sent to {} for statement {}", to, statementCode);
        } catch (Exception e) {
            log.error("Failed to send payment sent notification to {}", to, e);
        }
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0";
        return String.format("%,.0f VND", amount);
    }

    @Override
    public void sendSupportFormEmail(String toSupportEmail, String guestName, String guestEmail,
                                     String guestPhone, String subject, String messageContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toSupportEmail);
            helper.setReplyTo(guestEmail);
            helper.setSubject("[Support Form] " + subject);

            String phone = (guestPhone != null && !guestPhone.isBlank()) ? guestPhone : "Không cung cấp";

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                    + "<div style='background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 24px;'>HMS - Yêu cầu hỗ trợ mới</h1>"
                    + "</div>"
                    + "<div style='background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;'>"
                    + "<h2 style='color: #1e293b; margin-top: 0;'>Thông tin người gửi</h2>"
                    + "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>"
                    + "<tr><td style='padding: 8px 0; color: #64748b; width: 120px;'>Họ và tên:</td>"
                    + "<td style='padding: 8px 0; font-weight: bold; color: #1e293b;'>" + escapeHtml(guestName) + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #64748b;'>Email:</td>"
                    + "<td style='padding: 8px 0; font-weight: bold; color: #1e293b;'>" + escapeHtml(guestEmail) + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #64748b;'>Điện thoại:</td>"
                    + "<td style='padding: 8px 0; font-weight: bold; color: #1e293b;'>" + escapeHtml(phone) + "</td></tr>"
                    + "</table>"
                    + "<div style='border-top: 1px solid #e2e8f0; padding-top: 20px;'>"
                    + "<h3 style='color: #1e293b;'>Nội dung</h3>"
                    + "<div style='background: #f8fafc; padding: 16px; border-radius: 10px; color: #475569; line-height: 1.6; white-space: pre-wrap;'>"
                    + escapeHtml(messageContent)
                    + "</div></div>"
                    + "<p style='color: #94a3b8; font-size: 12px; margin-top: 24px;'>Email này được gửi từ form hỗ trợ trên website HMS.</p>"
                    + "</div></div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Support form email sent to {} from guest {}", toSupportEmail, guestEmail);
        } catch (Exception e) {
            log.error("Failed to send support form email to {}", toSupportEmail, e);
            throw new RuntimeException("Email sending failed");
        }
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
