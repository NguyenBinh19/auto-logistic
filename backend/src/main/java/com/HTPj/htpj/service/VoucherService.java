package com.HTPj.htpj.service;

public interface VoucherService {
    byte[] generateVoucherPdf(String bookingCode);

    String getVoucherFileName(String bookingCode);
}
