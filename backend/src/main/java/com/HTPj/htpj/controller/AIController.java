package com.HTPj.htpj.controller;

import com.HTPj.htpj.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {
    private final AIService aiService;

    @PostMapping
    public String chat(
            @RequestParam String sessionId,
            @RequestParam String userId,
            @RequestBody String message
    ) {
        return aiService.chat(sessionId, userId, message);
    }
}