// ================= AGENCY DATA =================
export const MOCK_AGENCY_DATA = {
    agencyId: "1",
    agencyName: "Hòa Bình Travel - Chi nhánh Hà Nội",
    legalName: "CÔNG TY TNHH DU LỊCH VÀ DỊCH VỤ HÒA BÌNH",
    taxCode: "0101234567",
    representativeName: "Nguyễn Ngọc Anh",
    businessLicenseNumber: "GP-2024-HBT",
    address: "Tòa nhà FPT, Khu Công nghệ cao Hòa Lạc, Hà Nội",
    email: "contact@hoabinhtravel.demo",
    hotline: "1900 1234",
    contactPhone: "0988 123 456",
    status: "ACTIVE",
    // Hạng GOLD PARTNER hưởng chiết khấu 15%
    rank: {
        rankId: 3,
        name: 'GOLD PARTNER',
        color: '#fbbf24',
        description: 'Bạn đang hưởng chiết khấu 15% cho mọi đơn hàng.',
        progress: 75
    },
    finance: {
        walletBalance: 25000000,
        creditLimit: 100000000,
        currentCredit: 15500000,
        availableCredit: 84500000,
        dueDate: '15/05/2026'
    },
    stats: {
        newBookings: 12,
        checkins: 8,
        staff: 5
    }
};

// ================= CHART & TRANSACTIONS =================
export const MOCK_CHART_DATA = [
    { day: "29/03", revenue: 12000000 },
    { day: "30/03", revenue: 8500000 },
    { day: "31/03", revenue: 15000000 },
    { day: "01/04", revenue: 21000000 },
    { day: "02/04", revenue: 18000000 },
    { day: "03/04", revenue: 25000000 },
    { day: "Today", revenue: 16150000 }, // Khớp với đơn BK9902 mới nhất
];

export const MOCK_TRANSACTIONS = [
    { id: 1, transactionType: "Thanh toán đơn hàng", description: "Thanh toán mã #BK9902", amount: 16150000, direction: "OUT", sourceType: "Wallet", createdAt: "2026-04-04 10:30" },
    { id: 2, transactionType: "Nạp tiền ví", description: "Nạp tiền qua VNPay", amount: 20000000, direction: "IN", sourceType: "Bank", createdAt: "2026-04-04 09:15" },
    { id: 3, transactionType: "Hoàn tiền", description: "Hoàn tiền hủy phòng #BK9850", amount: 1000000, direction: "IN", sourceType: "Wallet", createdAt: "2026-04-03 15:20" },
    { id: 4, transactionType: "Thanh toán đơn hàng", description: "Thanh toán mã #BK9901", amount: 2800000, direction: "OUT", sourceType: "Wallet", createdAt: "2026-04-03 08:00" },
    { id: 5, transactionType: "Nạp tiền ví", description: "Chuyển khoản MBBank", amount: 5000000, direction: "IN", sourceType: "Bank", createdAt: "2026-04-02 11:10" },
];

// ================= HOTEL & ROOM DATA =================
export const MOCK_HOTELS = [
    {
        hotel_id: 1,
        hotel_name: "InterContinental Danang Sun Peninsula Resort",
        star_rating: 5,
        address: "Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng, Việt Nam",
        city: "Đà Nẵng",
        country: "Việt Nam",
        description: "Khu nghỉ dưỡng sang trọng bậc nhất với tầm nhìn hướng biển.",
        email: "contact@intercontinental-danang.com",
        phone: "02363938888",
        amenities: "['Wifi', 'Pool', 'Beach', 'Spa']",
        status: "ACTIVE",
        commission_value: 30.00,
        rate_type: "DEFAULT",
    },
    {
        hotel_id: 2,
        address: "Bãi Dài, Gành Dầu, Phú Quốc",
        amenities: "['Wifi', 'Pool', 'Water Park']",
        city: "Phú Quốc",
        country: "Việt Nam",
        created_at: "2026-04-01 10:15:00.1234567",
        description: "Tổ hợp nghỉ dưỡng và vui chơi giải trí hàng đầu cho gia đình.",
        email: "res@vinpearl-phuquoc.com",
        hotel_name: "Vinpearl Resort & Spa Phú Quốc",
        phone: "02973550550",
        star_rating: 5,
        status: "ACTIVE",
        updated_at: "2026-04-02 11:30:00.0000000",
        commission_id: 2,
        commission_type: "PERCENT",
        commission_updated_at: "2026-03-26 14:00:00.0000000",
        commission_updated_by: "59576475-8d10-5d9c-bd32-6b829ef239gf",
        commission_value: 25.00,
        rate_type: "PROMO"
    },
    {
        hotel_id: 3,
        address: "15 Ngô Quyền, Hoàn Kiếm, Hà Nội",
        amenities: "['Wifi', 'Fine Dining', 'Bar']",
        city: "Hà Nội",
        country: "Việt Nam",
        created_at: "2026-03-20 08:00:00.0000000",
        description: "Khách sạn di sản mang đậm phong cách Pháp cổ điển.",
        email: "h1555@sofitel.com",
        hotel_name: "Sofitel Legend Metropole Hanoi",
        phone: "02438266919",
        star_rating: 5,
        status: "ACTIVE",
        updated_at: "2026-04-01 15:45:00.0000000",
        commission_id: 3,
        commission_type: "FIXED",
        commission_updated_at: "2026-03-28 09:30:00.0000000",
        commission_updated_by: "48465364-7c09-4c8b-ac21-5a719df128fe",
        commission_value: 500000.00,
        rate_type: "NET"
    },
    {
        hotel_id: 4,
        address: "270 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng",
        amenities: "['Wifi', 'Gym', 'Rooftop Pool']",
        city: "Đà Nẵng",
        country: "Việt Nam",
        created_at: "2026-04-01 09:11:00.3394210",
        description: "Khách sạn tiêu chuẩn 4 sao nằm ngay sát mặt biển Mỹ Khê.",
        email: "sales@danang.muongthanh.vn",
        hotel_name: "Mường Thanh Luxury Đà Nẵng",
        phone: "02363956789",
        star_rating: 4,
        status: "ACTIVE",
        updated_at: "2026-04-01 09:11:00.3394210",
        commission_id: 1,
        commission_type: "PERCENT",
        commission_updated_at: "2026-03-25 13:51:23.5519225",
        commission_updated_by: "48465364-7c09-4c8b-ac21-5a719df128fe",
        commission_value: 30.00,
        rate_type: "PERCENT"
    },
    {
        hotel_id: 5,
        address: "Đồi Quan 6, Tổ 10, Sa Pa",
        amenities: "['Wifi', 'Heated Pool', 'Mountain View']",
        city: "Sa Pa",
        country: "Việt Nam",
        created_at: "2026-03-15 14:20:00.0000000",
        description: "Khách sạn 5 sao với vườn hoa rực rỡ và view thung lũng Mường Hoa.",
        email: "info@silkpathresort.com",
        hotel_name: "Silk Path Grand Resort Sapa",
        phone: "02143788555",
        star_rating: 5,
        status: "ACTIVE",
        updated_at: "2026-04-02 16:10:00.0000000",
        commission_id: 5,
        commission_type: "PERCENT",
        commission_updated_at: "2026-03-30 10:00:00.0000000",
        commission_updated_by: "59576475-8d10-5d9c-bd32-6b829ef239gf",
        commission_value: 20.00,
        rate_type: "DEFAULT"
    }
];

export const MOCK_HOTEL_IMAGES = [
    { image_id: 1, hotel_id: 1, image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", is_cover: true, sort_order: 1 },
    { image_id: 2, hotel_id: 1, image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", is_cover: false, sort_order: 2 },
    { image_id: 3, hotel_id: 2, image_url: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", is_cover: true, sort_order: 1 },
    { image_id: 4, hotel_id: 3, image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", is_cover: true, sort_order: 1 },
    { image_id: 5, hotel_id: 4, image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", is_cover: true, sort_order: 1 },
    { image_id: 6, hotel_id: 5, image_url: "https://plus.unsplash.com/premium_photo-1687960116497-0dc41e1808a2?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", is_cover: true, sort_order: 1 },
];
// ================= ROOM TYPES DATA (Bảng room_types) =================
export const MOCK_ROOM_TYPES = [
    {
        room_type_id: 101,
        hotel_id: 1,
        room_title: "Classic Ocean View",
        room_code: "COV-01",
        base_price: 8500000.00, // Giá gốc 1 đêm
        bed_type: "1 Giường King",
        max_adults: 2,
        max_children: 1,
        room_area: 70.0,
        amenities: "['Wifi', 'AC', 'Minibar', 'Bathtub']",
        room_status: "ACTIVE",
        total_rooms: 10
    },
    {
        room_type_id: 102,
        hotel_id: 1,
        room_title: "Penthouse Modern Suite",
        room_code: "PMS-02",
        description: "Căn hộ cao cấp trên tầng thượng với hồ bơi vô cực riêng và quản gia phục vụ 24/7.",
        base_price: 25000000.00,
        bed_type: "1 Giường Super King",
        max_adults: 2,
        max_children: 2,
        room_area: 150.0,
        amenities: ["Wifi", "Private Pool", "Coffee Machine", "Wine Cooler"], // Demo dạng mảng
        room_status: "ACTIVE",
        total_rooms: 2,
        created_at: "2026-03-20 08:00:00",
        updated_at: "2026-04-01 10:00:00"
    },
    {
        room_type_id: 301,
        hotel_id: 3,
        room_title: "Luxury Heritage Room",
        room_code: "LHR-03",
        description: "Phòng mang đậm dấu ấn lịch sử với phong cách kiến trúc Pháp cổ.",
        base_price: 5500000.00,
        bed_type: "1 Giường Queen",
        max_adults: 2,
        max_children: 0,
        room_area: 35.0,
        amenities: "['Wifi', 'Heritage Furniture', 'Welcome Fruit']",
        room_status: "INACTIVE", // Để test logic không cho đặt
        total_rooms: 5,
        created_at: "2026-03-10 09:00:00",
        updated_at: "2026-03-10 09:00:00"
    },
    {
        room_type_id: 201,
        hotel_id: 2,
        room_title: "Deluxe Garden View",
        room_code: "DGV-02",
        description: "Phòng tiêu chuẩn với tầm nhìn ra khu vườn nhiệt đới xanh mướt.",
        base_price: 3200000.00,
        bed_type: "2 Giường Đơn",
        max_adults: 2,
        max_children: 2,
        room_area: 42.0,
        amenities: "['Wifi', 'AC', 'Balcony', 'TV']",
        room_status: "ACTIVE",
        total_rooms: 20
    },
    {
        room_type_id: 401,
        hotel_id: 4,
        room_title: "Superior Ocean View",
        room_code: "SOV-04",
        description: "Phòng hướng biển Mỹ Khê với thiết kế hiện đại, ấm cúng.",
        base_price: 1800000.00,
        bed_type: "1 Giường King",
        max_adults: 2,
        max_children: 1,
        room_area: 32.0,
        amenities: "['Wifi', 'Work Desk', 'Minibar']",
        room_status: "ACTIVE",
        total_rooms: 50
    },
    {
        room_type_id: 501,
        hotel_id: 5,
        room_title: "Classic Terrace Mountain View",
        room_code: "CTM-05",
        description: "Phòng có ban công riêng nhìn ra dãy Hoàng Liên Sơn hùng vĩ.",
        base_price: 4500000.00,
        bed_type: "1 Giường King",
        max_adults: 2,
        max_children: 1,
        room_area: 40.0,
        amenities: "['Wifi', 'Heater', 'Bathtub', 'Balcony']",
        room_status: "ACTIVE",
        total_rooms: 15
    }
];

// ================= ROOM IMAGES DATA (Bảng room_type_images) =================
export const MOCK_ROOM_IMAGES = [
    { image_id: 1, room_type_id: 101, s3_key: "https://images.unsplash.com/photo-1590490360182-c33d57733427", created_at: "2026-03-20" },
    { image_id: 2, room_type_id: 101, s3_key: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", created_at: "2026-03-20" },
    { image_id: 3, room_type_id: 102, s3_key: "https://plus.unsplash.com/premium_photo-1661879252375-7c1db1932572?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", created_at: "2026-03-20" },
    { image_id: 4, room_type_id: 301, s3_key: "https://images.unsplash.com/photo-1618773928121-c32242e63f39", created_at: "2026-03-20" },
    { image_id: 5, room_type_id: 201, s3_key: "https://images.unsplash.com/photo-1611892440504-42a792e24d32", created_at: "2026-03-25" },
    { image_id: 6, room_type_id: 401, s3_key: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304", created_at: "2026-04-01" },
    { image_id: 7, room_type_id: 501, s3_key: "https://images.unsplash.com/photo-1566665797739-1674de7a421a", created_at: "2026-03-30" }
];

// ================= ROOM HOLDS (Bảng room_holds) =================
export const MOCK_ROOM_HOLDS = [
    {
        id: 5001,
        hotel_id: 1,
        hold_code: "HLD-778899",
        check_in_date: "2026-04-10",
        check_out_date: "2026-04-12",
        status: "HOLDING",
        created_at: "2026-04-04 10:00:00",
        expired_at: "2026-04-04 10:15:00" // Hết hạn sau 15 phút
    }
];

// ================= HOLD DETAILS =================
// Chi tiết các loại phòng nằm trong một phiên giữ chỗ
export const MOCK_ROOM_HOLD_DETAILS = [
    {
        id: 1,
        hold_id: 5001,
        room_type_id: 101,
        quantity: 2
    },
    {
        id: 2,
        hold_id: 5001,
        room_type_id: 102,
        quantity: 1
    }
];

// ================= BOOKING HISTORY & DETAIL =================
export const MOCK_BOOKINGS = [
    {
        bookingId: 1001,
        agencyId: "1",
        bookingCode: "BK9902",
        bookingStatus: "BOOKED",
        paymentStatus: "PAID",
        paymentMethod: "WALLET",
        hotelId: 1,
        hotelName: "InterContinental Danang Sun Peninsula Resort",
        guestName: "NGUYỄN NGỌC ANH",
        guestPhone: "0988123456",
        checkInDate: "2026-04-10",
        checkOutDate: "2026-04-12",
        nights: 2,
        totalRooms: 1,
        totalGuests: 2,
        totalAmount: 19000000, // 17tr phòng + 2tr dịch vụ
        discountTotal: 2850000, // 15% của 19tr
        finalAmount: 16150000,
        createdAt: "2026-04-04T10:30:00Z",
        hasFeedback: false
    },
    {
        bookingId: 1003,
        bookingCode: "BK9850",
        bookingStatus: "CANCELLED",
        paymentStatus: "REFUNDED",
        hotelId: 4,
        hotelName: "Mường Thanh Luxury Đà Nẵng",
        guestName: "LÊ VĂN TÁM",
        checkInDate: "2026-03-20",
        checkOutDate: "2026-03-21",
        nights: 1,
        totalAmount: 1500000,
        finalAmount: 1500000,
        cancellationPenalty: 500000,
        refundAmount: 1000000, // Khớp với giao dịch hoàn tiền id: 3
        createdAt: "2026-03-15T09:00:00Z",
    }
];

export const MOCK_BOOKING_FULL_DETAIL = {
    bookingId: 1001,
    bookingCode: "BK9902",
    bookingStatus: "BOOKED",
    paymentStatus: "PAID",
    paymentMethod: "WALLET",
    hasFeedback: false,
    createdAt: "2026-04-04T10:30:00Z",

    hotelId: 1,
    hotelName: "InterContinental Danang Sun Peninsula Resort",
    hotelStarRating: 5,
    hotelAddress: "Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng, Việt Nam",

    checkInDate: "2026-04-10T14:00:00",
    checkOutDate: "2026-04-12T12:00:00",
    nights: 2,
    totalGuests: 2,
    totalRooms: 1,

    guestName: "NGUYỄN NGỌC ANH",
    guestPhone: "0988123456",
    guestEmail: "nguyenanh@example.com",
    notes: "Khách VIP, hưởng chiết khấu Gold Partner 15%. Yêu cầu phòng tầng cao.",

    roomDetails: [
        {
            bookingDetailId: 501,
            roomTypeId: 101,
            roomTitle: "Classic Ocean View",
            quantity: 1,
            pricePerNight: 8500000,
            totalAmount: 17000000, // 8.5tr x 2 đêm
            bedType: "1 Giường King",
            maxGuests: 3,
        }
    ],

    addonServices: [
        {
            serviceName: "Đưa đón sân bay (Luxury Sedan)",
            quantity: 1,
            totalPrice: 1200000
        },
        {
            serviceName: "Ăn sáng phục vụ tại ban công",
            quantity: 2,
            totalPrice: 800000
        }
    ],

    // LOGIC TÀI CHÍNH:
    // Tổng (Room 17tr + Addon 2tr) = 19,000,000
    // Chiết khấu Gold (15%) = 2,850,000
    // Phải thanh toán = 16,150,000
    totalAmount: 19000000,
    discountAmount: 2850000,
    finalAmount: 16150000,

    cancellationPenalty: 0,
    refundAmount: 16150000,
    reason: ""
};