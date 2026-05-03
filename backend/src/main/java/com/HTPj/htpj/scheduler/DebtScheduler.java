package com.HTPj.htpj.scheduler;

import com.HTPj.htpj.entity.AgencyBooking;
import com.HTPj.htpj.repository.AgencyBookingRepository;
import com.HTPj.htpj.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DebtScheduler {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AgencyBookingRepository agencyBookingRepository;

    @Scheduled(cron = "0 5 0 * * *")
    public void runDailyDebtCalculation() {
        bookingService.recalculateDebts();
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void updateInUseStatus() {

        LocalDate today = LocalDate.now();

        boolean shouldEnable;

        if (today.getDayOfMonth() >= 26) {
            shouldEnable = true;
        } else {
            shouldEnable = today.getDayOfMonth() <= 2;
        }

        if (shouldEnable) {
            agencyBookingRepository.enableInUseForUnusedRecords();
        }
    }
}
