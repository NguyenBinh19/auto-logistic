//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.entity.Agency;
//import com.HTPj.htpj.entity.TransactionHistory;
//import com.HTPj.htpj.repository.AgencyRepository;
//import com.HTPj.htpj.repository.TransactionHistoryRepository;
//import com.HTPj.htpj.service.impl.SePayWebhookServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.math.BigDecimal;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.Assert.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class SepayWebhookServiceImplTest {
//
//    @Mock
//    AgencyRepository agencyRepo;
//
//    @Mock
//    TransactionHistoryRepository transactionHistoryRepository;
//
//    @InjectMocks
//    SePayWebhookServiceImpl sePayWebhookService;
//
//    @Test
//    void processWebhook_Success_ShouldUpdateBalanceAndSaveHistory() {
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("transactionDate", "2026-04-14 09:00:00");
//        payload.put("transferAmount", "500000");
//        payload.put("content", "NAP 123");
//
//        Agency agency = Agency.builder()
//                .agencyId(123L)
//                .walletBalance(new BigDecimal("100000"))
//                .build();
//
//        TransactionHistory mockHistory = TransactionHistory.builder().id(1L).build();
//
//        when(agencyRepo.findById(123L)).thenReturn(Optional.of(agency));
//        when(transactionHistoryRepository.save(any(TransactionHistory.class))).thenReturn(mockHistory);
//
//
//        sePayWebhookService.processWebhook(payload);
//
//        assertThat(agency.getWalletBalance()).isEqualByComparingTo("600000");
//
//        verify(agencyRepo, times(1)).save(agency);
//
//        verify(transactionHistoryRepository, times(2)).save(any(TransactionHistory.class));
//        assertThat(mockHistory.getTransactionCode()).isEqualTo("TRK-000001");
//    }
//
//    @Test
//    void processWebhook_InvalidContent_ShouldDoNothing() {
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("transactionDate", "2026-04-14 09:00:00");
//        payload.put("transferAmount", "100000");
//        payload.put("content", "Chuyen tien an trưa");
//
//        // WHEN
//        sePayWebhookService.processWebhook(payload);
//
//        verify(agencyRepo, never()).findById(anyLong());
//        verify(transactionHistoryRepository, never()).save(any());
//    }
//
//    @Test
//    void processWebhook_AgencyNotFound_ShouldAbortSilently() {
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("transactionDate", "2026-04-14 09:00:00");
//        payload.put("transferAmount", "100000");
//        payload.put("content", "NAP 999");
//
//        when(agencyRepo.findById(999L)).thenReturn(Optional.empty());
//
//        sePayWebhookService.processWebhook(payload);
//
//        verify(agencyRepo, never()).save(any());
//        verify(transactionHistoryRepository, never()).save(any());
//    }
//
//    @Test
//    void processWebhook_ContentWithNoSpace_ShouldStillWork() {
//        // GIVEN: Test Regex "NAP\\s*(\\d+)" với trường hợp không có dấu cách
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("transactionDate", "2026-04-14 09:00:00");
//        payload.put("transferAmount", "200000");
//        payload.put("content", "NAP123");
//
//        Agency agency = Agency.builder().agencyId(123L).walletBalance(BigDecimal.ZERO).build();
//        when(agencyRepo.findById(123L)).thenReturn(Optional.of(agency));
//        when(transactionHistoryRepository.save(any())).thenReturn(new TransactionHistory());
//
//        sePayWebhookService.processWebhook(payload);
//
//        verify(agencyRepo).findById(123L);
//        assertThat(agency.getWalletBalance()).isEqualByComparingTo("200000");
//    }
//
//    @Test
//    void processWebhook_MissingData_ShouldThrowException() {
//        Map<String, Object> payload = Map.of(
//                "transferAmount", "100000",
//                "content", "NAP 123"
//        );
//
//        assertThrows(NullPointerException.class, () -> sePayWebhookService.processWebhook(payload));
//    }
//
//
//}