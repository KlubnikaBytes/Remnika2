package com.remnika.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_KEY = "353c731b58651c6b3719aa86";
    private static final String BASE_URL = "https://v6.exchangerate-api.com/v6/" + API_KEY + "/pair/";

    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency) {
        if (fromCurrency.equalsIgnoreCase(toCurrency)) {
            return BigDecimal.ONE;
        }

        String url = BASE_URL + fromCurrency + "/" + toCurrency;
        try {
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && "success".equals(response.get("result"))) {
                Object rateObj = response.get("conversion_rate");
                // Handle Integer or Double from JSON
                return new BigDecimal(rateObj.toString());
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch exchange rate: " + e.getMessage());
        }

        throw new RuntimeException("Unable to fetch exchange rate for " + fromCurrency + " to " + toCurrency);
    }
}
