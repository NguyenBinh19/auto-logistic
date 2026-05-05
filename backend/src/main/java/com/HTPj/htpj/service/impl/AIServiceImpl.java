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
                .apiKey("")
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

    private static final String KNOWLEDGE_PART_4_REGULATION_AGENCY = """
         1. Tổng quan hệ thống & phạm vi
                HMS-B2B là nền tảng đặt phòng B2B cho Đại lý (Agency).
                Áp dụng cho:
                Agency Manager (admin chính)
                Agency Staff (nhân sự)
                Tất cả thao tác trên hệ thống = giao dịch điện tử hợp pháp.
                Điều khoản là một phần của hợp đồng hợp tác.
         2. Nguyên tắc pháp lý & ưu tiên áp dụng
            
                Thứ tự ưu tiên khi có xung đột:
            
                Chính sách hiển thị tại checkout (booking cụ thể)
                Phụ lục chuyên đề (credit / cancel / refund…)
                Điều khoản chung
            
                👉 Rule quan trọng cho AI:
            
                “UI tại thời điểm confirm là source of truth”
            
         3. Tài khoản & trách nhiệm
                Đại lý chịu trách nhiệm mọi hành động từ tài khoản
                Agency Manager:
                tạo / khóa / phân quyền staff
                Phải:
                bảo mật account, OTP
                không chia sẻ tài khoản
                Công ty có quyền:
                khóa / hạn chế / yêu cầu xác minh
         4. KYC & xác minh
                Bắt buộc cung cấp hồ sơ pháp lý
                Có thể:
                bị hạn chế chức năng nếu chưa KYC
                KYC ≠ auto có Credit Limit
         5. Nguyên tắc booking
                Booking hợp lệ khi:
                user confirm + system ghi nhận
                Trước khi confirm phải check:
                giá, policy, ngày, số phòng…
                Hệ thống có thể:
                giữ tồn kho
                auto release / cancel
            
         Rule AI:
            
                Booking = immutable contract sau khi confirm
            
         6. Thanh toán & Credit
                Phương thức:
                Wallet
                Credit Limit
                Khác (nếu có)
                Credit:
                Không auto cấp
                Phải được duyệt
                Chu kỳ công nợ:
                26 → 25 tháng sau
                Due: ngày 02 tháng kế tiếp
                Quá hạn:
                Có lãi (2 giai đoạn):
                GĐ1: 0.03%/ngày
                GĐ2: 0.05%/ngày + khóa account
                Rule quan trọng:
                Trả tiền = trừ lãi trước → gốc sau
                🔹 7. Xếp hạng Agency
                2 kỳ:
                H1: 01/01 – 30/06
                H2: 01/07 – 31/12
                Ảnh hưởng:
                hạn mức
                quyền lợi
            
                Không được nâng hạng nếu:
            
                nợ quá hạn
                vi phạm
                chưa KYC
                🔹 8. Hủy booking / Refund / No-show
                Nguyên tắc:
                Không hỗ trợ hủy một phần
                Chỉ hủy toàn bộ booking
                Chính sách chuẩn:
            
                7 ngày: free (100% refund)
            
                3–7 ngày: phí 50%
                <3 ngày hoặc no-show: 100%
                Công thức:
                refund = paid_amount - cancellation_fee
                No-show:
                luôn phí tối đa (100%)
            
         Rule AI:
            
                Cancellation policy = snapshot tại thời điểm checkout
            
         9. Xử lý tài chính khi hủy
                Wallet → hoàn về ví
                Credit → giảm công nợ
                Mixed → hoàn theo nguồn tiền
                🔹 10. Khiếu nại (Dispute)
                Thời hạn: 3 ngày làm việc
                Kênh: chính thức (system)
                Source of truth:
                audit log
                timestamp
                booking snapshot
            
                👉 Rule AI:
            
                System data > user claim
            
                🔹 11. Khóa / tạm ngừng tài khoản
            
                Có thể xảy ra khi:
            
                sai thông tin
                nợ xấu
                gian lận
                yêu cầu pháp lý
            
                ⚠️ Không làm mất nghĩa vụ tài chính
            
                🔹 12. Dữ liệu & bảo mật
            
                Thu thập:
            
                account
                booking
                payment
                log hệ thống
            
                Mục đích:
            
                vận hành
                chống fraud
                pháp lý
            
                Không:
            
                bán dữ liệu
                🔹 13. Quyền dữ liệu người dùng
            
                Có quyền:
            
                xem / sửa / xóa / phản đối
            
                Nhưng bị hạn chế nếu:
            
                liên quan giao dịch
                nghĩa vụ pháp lý
                🔹 14. Giá trị pháp lý
                Click / OTP / confirm = ký hợp đồng
                Không được nói:
                “tôi chưa đọc”
                “tôi không biết”
            
                👉 Rule AI cực quan trọng:
            
                User action = legally binding
            
                🔹 15. Nguyên tắc hệ thống (rất quan trọng cho AI)
                Core rules:
                Booking là atomic
                Không partial cancel
                UI checkout = final truth
                System log = evidence
                Payment allocation:
                interest → principal
                Credit overdue:
                auto interest + auto lock
                🔹 16. Data model gợi ý (để train AI/backend)
            
                Bạn có thể extract thành:
            
                Booking:
                id
                status (confirmed / cancelled / no-show)
                price_snapshot
                policy_snapshot
                payment_method
                created_at
                Financial:
                wallet_balance
                credit_limit
                outstanding_debt
                interest_accrued
                Audit:
                action_log
                timestamp
                actor
    """;


    private static final String KNOWLEDGE_PART_REGULATION_HOTEL = """
        phần này là ĐIỀU KHOẢN SỬ DỤNG & HỢP TÁC NỀN TẢNG HMS-B2B DÀNH CHO KHÁCH SẠN
        1. Phạm vi & đối tượng
                Áp dụng cho Khách sạn sử dụng hệ thống HMS-B2B (Hotel Owner, Hotel Staff, người được ủy quyền).
                Điều chỉnh toàn bộ hoạt động:
                quản lý phòng – giá – tồn kho – booking – vận hành lưu trú – đối soát – thanh toán – giao dịch điện tử.
                Là một phần của quan hệ hợp tác giữa Khách sạn và hệ thống.
                2. Nguyên tắc pháp lý
                Tuân thủ pháp luật Việt Nam.
                Giao dịch trên hệ thống = giao dịch điện tử hợp pháp.
                Thứ tự ưu tiên:
                Chính sách hiển thị tại thời điểm giao dịch
                Phụ lục chuyên đề
                Điều khoản chung
                3. Khái niệm cốt lõi
                Booking: đặt phòng hợp lệ trên hệ thống
                Booking Confirmed: đã xác nhận + khóa tồn kho
                No-show: khách không đến, không hủy trước
                Direct Credit: cho phép Agency đặt phòng dạng tín dụng
                Payout Statement: bảng kê thanh toán
                Secured Revenue: doanh thu đủ điều kiện chi trả
                Deferred / On Hold / Blocked:
                Deferred: chuyển kỳ sau
                On Hold: tạm giữ
                Blocked: không thể chi trả
                4. Tài khoản & KYC
                Khách sạn phải:
                Cung cấp thông tin đúng, đầy đủ
                Thực hiện KYC
                Công ty có quyền:
                Từ chối / khóa / hạn chế tài khoản nếu có rủi ro
                Khách sạn chịu trách nhiệm mọi thao tác từ tài khoản của mình
                5. Quyền & nghĩa vụ khách sạn
                Nghĩa vụ chính:
                Cập nhật chính xác:
                thông tin khách sạn
                phòng, giá, allotment
                Không:
                gian lận dữ liệu
                thao túng giá/tồn kho
                Phối hợp khi:
                đối soát
                khiếu nại
                Quyền của hệ thống:
                Giới hạn / khóa / kiểm soát nếu có rủi ro
                6. Quản lý phòng – giá – tồn kho
                Hotel Owner quản lý:
                room type, giá, allotment, stop-sell
                Khách sạn chịu trách nhiệm:
                tránh overbooking
                cập nhật tồn kho kịp thời
                7. Vận hành booking
                Khách sạn phải:
                tiếp nhận & phục vụ booking hợp lệ
                cập nhật check-in / check-out / no-show đúng
                Không được:
                thu tiền lại nếu HMS đã thu
                Dữ liệu vận hành = căn cứ tính doanh thu
                8. Direct Credit
                Khách sạn có thể whitelist Agency
                Nhưng:
                hệ thống vẫn kiểm soát rủi ro
                không đảm bảo chắc chắn được thanh toán
                9. Doanh thu & chi trả (CORE LOGIC)
                Điều kiện để được trả tiền:
                Thuộc kỳ đối soát
                Không tranh chấp
                Đã hoàn thành dịch vụ
                Agency đã thanh toán (hoặc được đảm bảo)
                Công thức:
                Payout = Revenue - commission - refund - penalty - hold
                Có thể bị:
                Deferred (chuyển kỳ)
                On Hold (tạm giữ)
                Blocked (không trả)
                10. Chu kỳ thanh toán
                Kỳ đối soát: 26 → 25 tháng sau
                Tạo bảng kê: ngày 03
                Xác nhận: 03 → 05
                Chi trả: 06 → 09
                11. Xác nhận & khiếu nại
                Khách sạn phải:
                xác nhận bảng kê đúng hạn
                Không xác nhận → có thể bị deferred
                Khiếu nại:
                trong 3 ngày làm việc
                Dữ liệu hệ thống = nguồn chính để xử lý
                12. Tài khoản nhận tiền
                Phải:
                đúng & xác minh
                Sai thông tin → tự chịu rủi ro
                Tài khoản payout:
                bị lock theo từng kỳ
                13. Hủy booking & No-show
                Chính sách mặc định:
            
                7 ngày: miễn phí
            
                3–7 ngày: phí 50%
                <3 ngày hoặc no-show: phí 100%
                Lưu ý:
                Không hỗ trợ hủy 1 phần booking
                No-show = mất toàn bộ tiền
                14. Khiếu nại & dispute
                Phải gửi qua hệ thống
                Thời hạn: 3 ngày
                Audit log hệ thống = nguồn quyết định
                15. Tạm ngừng / khóa tài khoản
            
                Xảy ra khi:
            
                Gian lận / vi phạm
                Sai thông tin
                Rủi ro pháp lý/tài chính
                Yêu cầu từ cơ quan nhà nước
                16. Dữ liệu & bảo mật
                Hệ thống thu thập:
                thông tin tài khoản
                dữ liệu booking
                log kỹ thuật
                Mục đích:
                vận hành, thanh toán, chống gian lận
                Không bán dữ liệu trái phép
                17. Quyền dữ liệu cá nhân
            
                Người dùng có quyền:
            
                truy cập
                sửa
                xóa
                khiếu nại
            
                Nhưng có thể bị hạn chế nếu:
            
                liên quan giao dịch
                nghĩa vụ pháp lý
                18. Thanh toán nâng cao (quan trọng)
                Nguyên tắc:
                Chỉ trả “Secured Revenue”
                Agency chưa trả tiền → KHÔNG trả cho khách sạn
                Trường hợp đặc biệt:
                Thanh toán một phần → xử lý theo thứ tự:
                lãi → gốc
                Có thể:
                giữ tiền
                chuyển kỳ
                hoặc ứng trước (tùy hệ thống)
                19. Lãi chậm trả
                Chỉ áp dụng khi:
                lỗi hoàn toàn từ hệ thống
                Không áp dụng nếu:
                tiền đang hold / deferred / dispute
                20. Giá trị pháp lý
                Mọi thao tác:
                click
                OTP
                confirm
                → đều có giá trị pháp lý ràng buộc
                21. Hiệu lực & sửa đổi
                Có hiệu lực khi:
                Khách sạn đồng ý điện tử
                Công ty có quyền:
                sửa đổi điều khoản
                Tiếp tục sử dụng = đồng ý điều khoản mới
                22. Tóm tắt bản chất hệ thống (rất quan trọng để train AI)
                HMS-B2B là nền tảng trung gian thanh toán + vận hành booking
                Khách sạn:
                chịu trách nhiệm dữ liệu & vận hành
                Hệ thống:
                kiểm soát tiền & rủi ro
            
                Nguyên tắc cốt lõi:
            
                Không có tiền từ Agency → Không có payout cho Khách sạn
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
                safeSend(chat, KNOWLEDGE_PART_4_REGULATION_AGENCY);
                safeSend(chat, KNOWLEDGE_PART_REGULATION_HOTEL);

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