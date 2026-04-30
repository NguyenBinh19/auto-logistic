package com.HTPj.htpj.service;

import java.util.Map;

public interface SePayWebhookService {
    public void processWebhook(Map<String, Object> payload);
    public void processWebhookDemo(Map<String, Object> payload);
}
