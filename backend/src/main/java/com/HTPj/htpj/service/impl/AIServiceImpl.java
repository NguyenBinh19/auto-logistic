package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.service.AIService;
import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AIServiceImpl implements AIService {

    private final Client client;

    private final Map<String, Chat> sessions = new ConcurrentHashMap<>();

    public AIServiceImpl() {
        this.client = Client.builder()
                .apiKey("AIzaSyAT96T64hdfpfGBLw5y5a7AljctAqdAYCs")
                .build();
    }


    private static final String SYSTEM_ROLE = """
        Bạn là AI chăm sóc khách hàng của hệ thống HMS-B2B.
        Chỉ trả lời dựa trên workflow đã được cung cấp.
        Trả lời rõ ràng, dễ hiểu, giống CSKH thật.
        Nếu không chắc → nói không chắc, không được bịa.
    """;

    private static final String KNOWLEDGE_PART_1 = """
        Overview: HMS-B2B là hệ thống booking khách sạn B2B kết nối Agency và Hotel.

        Workflow 1 - KYC:
        - User đăng ký tài khoản
        - Nhận OTP email để verify
        - Upload giấy tờ pháp lý
        - Điền thông tin doanh nghiệp
        - Submit → Pending Approval
        - Admin duyệt → Approve / Reject
    """;

    private static final String KNOWLEDGE_PART_2 = """
        Workflow 2 - Booking:
        - Search hotel theo ngày, địa điểm
        - Xem danh sách khách sạn
        - Chọn phòng → giữ phòng tạm (có timer)
        - Nhập thông tin khách
        - Apply coupon / thêm dịch vụ
        - Confirm booking → tạo booking thành công

        Workflow 3 - Credit:
        - Xem hạn mức credit
        - Xem statement
        - Nếu quá hạn → có penalty
        - Click Pay Now để thanh toán
        - Sau khi trả → update lại credit
    """;

    private static final String KNOWLEDGE_PART_3 = """
        Workflow 4 - Payout:
        - Hotel xem payout statement
        - Check doanh thu, commission
        - Confirm statement
        - Admin xử lý payout
        - Hotel nhận tiền

        Workflow 5 - Cancellation:
        - Mở booking detail
        - Check policy
        - Nếu hợp lệ → cancel
        - Hệ thống tính penalty + refund
        - Update trạng thái booking = Cancelled
    """;


    @Override
    public String chat(String sessionId, String userId, String message) {

        Chat chatSession = sessions.computeIfAbsent(sessionId, id -> {
            Chat chat = client.chats.create("gemini-3-flash-preview");

            try {
                safeSend(chat, SYSTEM_ROLE);
                safeSend(chat, KNOWLEDGE_PART_1);
                safeSend(chat, KNOWLEDGE_PART_2);
                safeSend(chat, KNOWLEDGE_PART_3);

            } catch (Exception e) {
                e.printStackTrace();
            }

            return chat;
        });

        try {
            return safeSend(chatSession, message);
        } catch (Exception e) {
            e.printStackTrace();
            return "Hệ thống AI đang bận, vui lòng thử lại sau";
        }
    }


    private String safeSend(Chat chat, String msg) {
        int retry = 3;

        while (retry-- > 0) {
            try {
                GenerateContentResponse res = chat.sendMessage(msg);
                return res.text();
            } catch (Exception e) {
                if (retry == 0) throw e;

                try {
                    Thread.sleep(1000); // đợi 1s rồi retry
                } catch (InterruptedException ignored) {}
            }
        }
        return "AI lỗi";
    }
}