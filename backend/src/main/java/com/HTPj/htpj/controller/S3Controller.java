package com.HTPj.htpj.controller;

import com.HTPj.htpj.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/storage")
public class S3Controller {
    @Autowired
    private S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) throws IOException, IOException {
        s3Service.uploadFile(file);
        return ResponseEntity.ok("File uploaded successfully!");
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> download(@PathVariable String filename) {
        byte[] data = s3Service.downloadFile(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .body(data);
    }

    @PostMapping("/upload-chat")
    public ResponseEntity<Map<String, String>> uploadForChat(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String key = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        s3Service.uploadFile(file, key);

        String url = s3Service.getFileUrl(key);

        Map<String, String> res = new HashMap<>();
        res.put("url", url);
        res.put("fileName", file.getOriginalFilename());

        return ResponseEntity.ok(res);
    }
}