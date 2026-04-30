package com.HTPj.htpj;

import com.HTPj.htpj.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@RequiredArgsConstructor
public class HTPjApplication {
	public static void main(String[] args) {
		SpringApplication.run(HTPjApplication.class, args );
	}

	@Bean
	public CommandLineRunner run(BookingService bookingService) {
		return args -> {
			bookingService.recalculateDebts();
		};
	}

}
