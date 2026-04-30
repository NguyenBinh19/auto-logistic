package com.HTPj.htpj.service;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface EmailService {
    void sendWelcomeOnboardEmail(String to);
    void sendOtpEmail(String to, String otp, String username);
    void sendResetPasswordEmail(String to, String resetLink, String username);
    void sendPasswordChangedNotification(String to, String username);
    void sendNewReviewNotification(String to, String hotelName, String agencyName, int ratingScore, String bookingCode);
    void sendStaffAccountEmail(String to, String username, String password);
    void sendPayoutStatementNotification(String to, String hotelName, String statementCode,
                                         LocalDate periodStart, LocalDate periodEnd,
                                         BigDecimal grossRevenue, BigDecimal totalCommission,
                                         BigDecimal netPayout, Integer totalBookings);
    void sendPaymentSentNotification(String to, String hotelName, String statementCode,
                                     BigDecimal netPayout, String bankReference);
    void sendSupportFormEmail(String toSupportEmail, String guestName, String guestEmail,
                              String guestPhone, String subject, String messageContent);
}
