package com.HTPj.htpj.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface S3Service {
    public void uploadFile(MultipartFile file) throws IOException;
    public byte[] downloadFile(String key);
    public void uploadFile(MultipartFile file, String key) throws IOException;
    public String getFileUrl(String key);
    public void deleteFile(String key);
}
