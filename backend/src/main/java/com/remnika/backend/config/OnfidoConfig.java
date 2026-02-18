package com.remnika.backend.config;

import com.onfido.ApiClient;
import com.onfido.api.DefaultApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OnfidoConfig {

    @Value("${remnika.app.onfidoToken:dummy}")
    private String apiToken;

    @Bean
    public DefaultApi onfidoClient() {

        ApiClient apiClient = com.onfido.Configuration.getDefaultApiClient()
                .setApiToken(apiToken)
                .setRegion(ApiClient.Region.EU);

        return new DefaultApi(apiClient);
    }
}
