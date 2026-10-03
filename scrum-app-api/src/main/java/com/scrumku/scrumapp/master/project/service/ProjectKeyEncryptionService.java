package com.scrumku.scrumapp.master.project.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Slf4j
@Service
public class ProjectKeyEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits
    private static final int GCM_TAG_LENGTH = 16; // 128 bits

    @Value("${project.key.master-key}")
    private String masterKeyString;

    @Value("${project.key.length:8}")
    private int projectKeyLength;

    private SecretKey masterKey;

    /**
     * Initialize the master key from the configuration
     */
    private SecretKey getMasterKey() {
        if (masterKey == null) {
            try {
                // Convert hex string to bytes
                byte[] keyBytes = hexStringToByteArray(masterKeyString);
                masterKey = new SecretKeySpec(keyBytes, ALGORITHM);
            } catch (Exception e) {
                log.error("Failed to initialize master key", e);
                throw new RuntimeException("Failed to initialize encryption master key", e);
            }
        }
        return masterKey;
    }

    /**
     * Compute deterministic HMAC-SHA256 digest for project key lookup (hex lowercase)
     */
    public String computeProjectKeyDigest(String projectKeyPlaintext) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(getMasterKey());
            byte[] h = mac.doFinal(projectKeyPlaintext.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(h);
        } catch (Exception e) {
            log.error("Failed to compute project key digest", e);
            throw new RuntimeException("Failed to compute project key digest", e);
        }
    }

    /**
     * Encrypt a project key (without expiration timestamp)
     */
    public String encryptProjectKey(String projectKey) {
        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, getMasterKey(), gcmSpec);

            // Encrypt the data
            byte[] encryptedData = cipher.doFinal(projectKey.getBytes(StandardCharsets.UTF_8));

            // Combine IV + encrypted data
            byte[] combined = new byte[GCM_IV_LENGTH + encryptedData.length];
            System.arraycopy(iv, 0, combined, 0, GCM_IV_LENGTH);
            System.arraycopy(encryptedData, 0, combined, GCM_IV_LENGTH, encryptedData.length);

            // Return base64 encoded result
            return Base64.getEncoder().encodeToString(combined);

        } catch (Exception e) {
            log.error("Failed to encrypt project key", e);
            throw new RuntimeException("Failed to encrypt project key", e);
        }
    }

    /**
     * Decrypt a project key (without expiration validation)
     */
    public String decryptProjectKey(String encryptedKey) {
        if (encryptedKey == null || encryptedKey.isEmpty()) {
            return null;
        }

        try {
            // Decode base64
            byte[] combined = Base64.getDecoder().decode(encryptedKey);

            if (combined.length < GCM_IV_LENGTH) {
                throw new RuntimeException("Invalid encrypted key format");
            }

            // Extract IV and encrypted data
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encryptedData = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(combined, GCM_IV_LENGTH, encryptedData, 0, encryptedData.length);

            // Initialize cipher for decryption
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.DECRYPT_MODE, getMasterKey(), gcmSpec);

            // Decrypt the data
            byte[] decryptedData = cipher.doFinal(encryptedData);
            String projectKey = new String(decryptedData, StandardCharsets.UTF_8);

            return projectKey;

        } catch (Exception e) {
            log.error("Failed to decrypt project key", e);
            throw new RuntimeException("Failed to decrypt project key: " + e.getMessage(), e);
        }
    }

    /**
     * Generate a random project key
     */
    public String generateRandomProjectKey() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder key = new StringBuilder();

        for (int i = 0; i < projectKeyLength; i++) {
            key.append(chars.charAt(random.nextInt(chars.length())));
        }
        return key.toString();
    }

    /**
     * Convert hex string to byte array
     */
    private byte[] hexStringToByteArray(String hexString) {
        int len = hexString.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hexString.charAt(i), 16) << 4)
                    + Character.digit(hexString.charAt(i + 1), 16));
        }
        return data;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}