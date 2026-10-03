package com.scrumku.scrumapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ScrumAppApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ScrumAppApiApplication.class, args);
	}

}
