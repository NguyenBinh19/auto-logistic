package com.HTPj.htpj.controller;

import com.HTPj.htpj.service.SePayWebhookService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/sepay")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SePayWebhookController {

    private final SePayWebhookService webhookService;

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> payload) {
        webhookService.processWebhook(payload);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/webhook-demo")
    public ResponseEntity<?> handleWebhookDemo(@RequestBody Map<String, Object> payload) {
        webhookService.processWebhookDemo(payload);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
