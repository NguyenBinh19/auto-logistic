//package com.HTPj.htpj.service;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//import java.io.IOException;
//
//import com.HTPj.htpj.dto.vault.S3VaultProps;
//import com.HTPj.htpj.service.impl.S3ServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.test.util.ReflectionTestUtils;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.web.multipart.MultipartFile;
//
//import software.amazon.awssdk.core.ResponseBytes;
//import software.amazon.awssdk.core.sync.RequestBody;
//import software.amazon.awssdk.services.s3.S3Client;
//import software.amazon.awssdk.services.s3.model.*;
//
//@ExtendWith(MockitoExtension.class)
//class S3ServiceImplTest {
//
//    @Mock
//    private S3Client s3Client;
//
//    @Mock
//    private S3VaultProps props;
//
//    @InjectMocks
//    private S3ServiceImpl s3Service;
//
//    private final String bucketName = "test-bucket";
//    private final String key = "uploads/test.txt";
//    private MockMultipartFile mockFile;
//
//    @BeforeEach
//    void setUp() {
//        mockFile = new MockMultipartFile(
//                "file",
//                "test.txt",
//                "text/plain",
//                "Hello World".getBytes()
//        );
//
//        ReflectionTestUtils.setField(s3Service, "s3Client", s3Client);
//    }
//
//    // ===================== upload =====================
//
//    @Test
//    void uploadFile_N_Success() throws IOException {
//        when(props.getBucketName()).thenReturn(bucketName);
//
//        s3Service.uploadFile(mockFile, key);
//
//        verify(s3Client, times(1))
//                .putObject(any(PutObjectRequest.class), any(RequestBody.class));
//    }
//
//    @Test
//    void uploadFile_A_IOException() throws IOException {
//        MultipartFile corruptedFile = mock(MultipartFile.class);
//
//        when(props.getBucketName()).thenReturn(bucketName);
//        when(corruptedFile.getBytes()).thenThrow(new IOException("Read error"));
//
//        assertThatThrownBy(() -> s3Service.uploadFile(corruptedFile, key))
//                .isInstanceOf(IOException.class)
//                .hasMessage("Read error");
//    }
//
//    @Test
//    void uploadFile_A_S3Exception() {
//        when(props.getBucketName()).thenReturn(bucketName);
//
//        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
//                .thenThrow(S3Exception.builder().message("S3 Service Error").build());
//
//        assertThatThrownBy(() -> s3Service.uploadFile(mockFile, key))
//                .isInstanceOf(S3Exception.class)
//                .hasMessage("S3 Service Error");
//    }
//
//    // ===================== download =====================
//
//    @Test
//    void downloadFile_N_Success() {
//        byte[] expectedBytes = "Hello World".getBytes();
//        ResponseBytes<GetObjectResponse> mockResponse = mock(ResponseBytes.class);
//
//        when(props.getBucketName()).thenReturn(bucketName);
//        when(mockResponse.asByteArray()).thenReturn(expectedBytes);
//        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class))).thenReturn(mockResponse);
//
//        byte[] actualBytes = s3Service.downloadFile(key);
//
//        assertThat(actualBytes).isEqualTo(expectedBytes);
//    }
//
//    @Test
//    void downloadFile_A_FileNotFound() {
//        when(props.getBucketName()).thenReturn(bucketName);
//
//        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
//                .thenThrow(NoSuchKeyException.builder().message("The specified key does not exist").build());
//
//        assertThatThrownBy(() -> s3Service.downloadFile(key))
//                .isInstanceOf(NoSuchKeyException.class);
//    }
//
//    @Test
//    void downloadFile_A_S3Error() {
//        when(props.getBucketName()).thenReturn(bucketName);
//
//        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
//                .thenThrow(S3Exception.builder().message("Internal Server Error").build());
//
//        assertThatThrownBy(() -> s3Service.downloadFile(key))
//                .isInstanceOf(S3Exception.class);
//    }
//
//    // ===================== get url =====================
//
//    @Test
//    void getFileUrl_N_Success() {
//        when(props.getBucketName()).thenReturn("hms-bucket");
//        when(props.getRegion()).thenReturn("ap-southeast-1");
//
//        String actualUrl = s3Service.getFileUrl("avatars/user-01.jpg");
//
//        assertThat(actualUrl).isEqualTo(
//                "https://hms-bucket.s3.ap-southeast-1.amazonaws.com/avatars/user-01.jpg"
//        );
//    }
//
//    @Test
//    void getFileUrl_B_EmptyKey() {
//        when(props.getBucketName()).thenReturn("hms-bucket");
//        when(props.getRegion()).thenReturn("us-east-1");
//
//        String actualUrl = s3Service.getFileUrl("");
//
//        assertThat(actualUrl).isEqualTo(
//                "https://hms-bucket.s3.us-east-1.amazonaws.com/"
//        );
//    }
//
//    @Test
//    void getFileUrl_A_NullKey() {
//        when(props.getBucketName()).thenReturn("hms-bucket");
//        when(props.getRegion()).thenReturn("us-east-1");
//
//        String actualUrl = s3Service.getFileUrl(null);
//
//        assertThat(actualUrl).isEqualTo(
//                "https://hms-bucket.s3.us-east-1.amazonaws.com/null"
//        );
//    }
//
//    // ===================== delete =====================
//
//    @Test
//    void deleteFile_N_Success() {
//        when(props.getBucketName()).thenReturn(bucketName);
//
//        s3Service.deleteFile(key);
//
//        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
//    }
//
//    @Test
//    void deleteFile_A_S3ServiceException() {
//        when(props.getBucketName()).thenReturn(bucketName);
//
//        doThrow(new RuntimeException("S3 Connection Refused"))
//                .when(s3Client).deleteObject(any(DeleteObjectRequest.class));
//
//        assertThrows(RuntimeException.class, () -> s3Service.deleteFile(key));
//    }
//
//    @Test
//    void deleteFile_B_SpecialCharactersKey() {
//        String specialKey = "folder/tên file @#$%^&.pdf";
//        when(props.getBucketName()).thenReturn(bucketName);
//
//        s3Service.deleteFile(specialKey);
//
//        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
//    }
//
//}