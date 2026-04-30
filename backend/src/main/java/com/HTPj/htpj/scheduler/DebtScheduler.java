package com.HTPj.htpj.scheduler;

import com.HTPj.htpj.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DebtScheduler {

    @Autowired
    private BookingService bookingService;

    @Scheduled(cron = "0 5 0 * * *")
    public void runDailyDebtCalculation() {
        bookingService.recalculateDebts();
    }
}
