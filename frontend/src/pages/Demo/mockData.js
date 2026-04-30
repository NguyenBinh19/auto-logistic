// Mock data for Hotel Owner demo flow
// All data is static - no API calls

export const DEMO_HOTEL = {
    hotelId: 999,
    hotelName: "Grand Palace Đà Nẵng",
    address: "128 Võ Nguyên Giáp, Sơn Trà",
    city: "Đà Nẵng",
    country: "Việt Nam",
    phone: "0236 3888 999",
    email: "info@grandpalace-dn.vn",
    description:
        "Khách sạn 5 sao tọa lạc ngay trung tâm thành phố Đà Nẵng, cách biển Mỹ Khê chỉ 200m. Với 120 phòng tiện nghi hiện đại, nhà hàng, hồ bơi và spa đẳng cấp.",
    amenities: [
        "Wi-Fi",
        "Hồ bơi",
        "Spa",
        "Phòng gym",
        "Nhà hàng",
        "Bar",
        "Dịch vụ giặt là",
        "Đưa đón sân bay",
    ],
    coverImage: null,
    starRating: 5,
};

export const DEMO_ROOM_TYPES = [
    {
        id: 1,
        title: "Deluxe Double",
        adults: 2,
        children: 1,
        area: 35,
        totalRooms: 40,
        availableRooms: 12,
        basePrice: 1500000,
        isActive: true,
        description: "Phòng Deluxe với giường đôi, view thành phố",
        amenities: ["TV", "Minibar", "Két sắt", "Bàn làm việc"],
    },
    {
        id: 2,
        title: "Superior Twin",
        adults: 2,
        children: 2,
        area: 40,
        totalRooms: 30,
        availableRooms: 8,
        basePrice: 1800000,
        isActive: true,
        description: "Phòng Superior với 2 giường đơn, view biển",
        amenities: ["TV", "Minibar", "Két sắt", "Bàn làm việc", "Bồn tắm"],
    },
    {
        id: 3,
        title: "Executive Suite",
        adults: 2,
        children: 1,
        area: 55,
        totalRooms: 15,
        availableRooms: 5,
        basePrice: 3200000,
        isActive: true,
        description: "Suite sang trọng với phòng khách riêng biệt",
        amenities: ["TV", "Minibar", "Két sắt", "Bàn làm việc", "Bồn tắm", "Phòng khách"],
    },
    {
        id: 4,
        title: "Presidential Suite",
        adults: 3,
        children: 2,
        area: 90,
        totalRooms: 5,
        availableRooms: 3,
        basePrice: 8500000,
        isActive: false,
        description: "Phòng Tổng thống, đẳng cấp cao nhất khách sạn",
        amenities: [
            "TV",
            "Minibar",
            "Két sắt",
            "Bàn làm việc",
            "Bồn tắm",
            "Phòng khách",
            "Ban công",
            "Phòng ăn",
        ],
    },
];

export const DEMO_DASHBOARD_STATS = {
    totalRevenue: 456800000,
    occupancyRate: 78.5,
    adr: 2150000,
    revPar: 1687750,
    revenueGrowthPercent: 12.3,
    totalBookingsToday: 23,
    roomsSold: 68,
};

export const DEMO_RECENT_BOOKINGS = [
    {
        bookingCode: "BK-20260401-001",
        guestName: "Nguyễn Văn Minh",
        agencyName: "VietTravel Agency",
        roomType: "Executive Suite",
        checkIn: "2026-04-05",
        checkOut: "2026-04-08",
        revenue: 9600000,
        status: "CONFIRMED",
    },
    {
        bookingCode: "BK-20260401-002",
        guestName: "Trần Thị Lan",
        agencyName: "GoTrip JSC",
        roomType: "Deluxe Double",
        checkIn: "2026-04-04",
        checkOut: "2026-04-06",
        revenue: 3000000,
        status: "CHECKED_IN",
    },
    {
        bookingCode: "BK-20260331-005",
        guestName: "Lê Hoàng Nam",
        agencyName: "SunTravel Co",
        roomType: "Superior Twin",
        checkIn: "2026-04-03",
        checkOut: "2026-04-05",
        revenue: 3600000,
        status: "CHECKED_OUT",
    },
    {
        bookingCode: "BK-20260330-003",
        guestName: "Phạm Đức Anh",
        agencyName: "VietTravel Agency",
        roomType: "Deluxe Double",
        checkIn: "2026-04-02",
        checkOut: "2026-04-04",
        revenue: 3000000,
        status: "COMPLETED",
    },
    {
        bookingCode: "BK-20260329-007",
        guestName: "Võ Minh Thư",
        agencyName: "HappyTour VN",
        roomType: "Presidential Suite",
        checkIn: "2026-04-01",
        checkOut: "2026-04-03",
        revenue: 17000000,
        status: "CANCELLED",
    },
];

export const DEMO_TASKS = {
    checkInsToday: 8,
    checkOutsToday: 5,
};

// Generate 14-day inventory grid
const generateInventoryGrid = () => {
    const grid = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        grid.push({
            date: dateStr,
            roomTypes: DEMO_ROOM_TYPES.filter((r) => r.isActive).map((rt) => ({
                roomTypeId: rt.id,
                roomTypeName: rt.title,
                totalRooms: rt.totalRooms,
                available: Math.max(
                    0,
                    rt.availableRooms - Math.floor(Math.random() * 3)
                ),
                rate: isWeekend
                    ? Math.round(rt.basePrice * 1.2)
                    : rt.basePrice,
                stopSell: i === 10 && rt.id === 1,
            })),
        });
    }
    return grid;
};
export const DEMO_INVENTORY_GRID = generateInventoryGrid();

export const DEMO_DYNAMIC_PRICING = {
    isAutoPricingOn: true,
    weeklyRules: [
        { day: "Mon", modifier: 0 },
        { day: "Tue", modifier: 0 },
        { day: "Wed", modifier: 0 },
        { day: "Thu", modifier: 5 },
        { day: "Fri", modifier: 15 },
        { day: "Sat", modifier: 20 },
        { day: "Sun", modifier: 10 },
    ],
    events: [
        {
            id: 1,
            name: "Lễ 30/4 - 1/5",
            startDate: "2026-04-29",
            endDate: "2026-05-02",
            modifier: 40,
            isActive: true,
        },
        {
            id: 2,
            name: "Lễ hội pháo hoa Đà Nẵng",
            startDate: "2026-06-01",
            endDate: "2026-06-30",
            modifier: 25,
            isActive: false,
        },
    ],
    occupancyRules: [
        { threshold: 50, modifier: 0 },
        { threshold: 70, modifier: 10 },
        { threshold: 85, modifier: 20 },
        { threshold: 95, modifier: 35 },
    ],
};

export const DEMO_REVENUE_DATA = {
    summary: {
        totalRevenue: 1368500000,
        totalBookings: 187,
        avgRevPerBooking: 7317000,
        occupancyRate: 76.2,
    },
    daily: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(2026, 2, i + 1);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const occupancy = isWeekend
            ? 75 + Math.floor(Math.random() * 20)
            : 55 + Math.floor(Math.random() * 25);
        const revenue =
            (isWeekend ? 65000000 : 38000000) +
            Math.floor(Math.random() * 15000000);
        const bookings = isWeekend
            ? 8 + Math.floor(Math.random() * 4)
            : 4 + Math.floor(Math.random() * 4);
        return {
            date: date.toISOString().split("T")[0],
            revenue,
            bookings,
            occupancy,
            adr: Math.round(revenue / Math.max(bookings, 1)),
        };
    }),
};

export const DEMO_PAYOUT_STATEMENTS = [
    {
        id: 1,
        statementCode: "PS-2026-02",
        periodStart: "2026-01-26",
        periodEnd: "2026-02-25",
        periodLabel: "26/01/2026 - 25/02/2026",
        totalBookings: 95,
        grossRevenue: 712000000,
        totalCommission: 71200000,
        netPayout: 640800000,
        status: "PAID",
    },
    {
        id: 2,
        statementCode: "PS-2026-03",
        periodStart: "2026-02-26",
        periodEnd: "2026-03-25",
        periodLabel: "26/02/2026 - 25/03/2026",
        totalBookings: 92,
        grossRevenue: 656500000,
        totalCommission: 65650000,
        netPayout: 590850000,
        status: "APPROVED",
    },
    {
        id: 3,
        statementCode: "PS-2026-04",
        periodStart: "2026-03-26",
        periodEnd: "2026-04-25",
        periodLabel: "26/03/2026 - 25/04/2026",
        totalBookings: 45,
        grossRevenue: 338200000,
        totalCommission: 33820000,
        netPayout: 304380000,
        status: "PENDING_CONFIRMATION",
    },
];

export const DEMO_PAYOUT_DETAIL = {
    statementCode: "PS-2026-03",
    periodStart: "2026-02-26",
    periodEnd: "2026-03-25",
    periodLabel: "26/02/2026 - 25/03/2026",
    totalBookings: 92,
    grossRevenue: 656500000,
    platformCommission: 65650000,
    tax: 32825000,
    netPayout: 557925000,
    status: "APPROVED",
    bankName: "Vietcombank",
    bankAccount: "****8899",
    bookings: [
        {
            bookingCode: "BK-20260228-012",
            guestName: "Nguyễn Minh Hiếu",
            room: "Executive Suite",
            nights: 3,
            amount: 9600000,
            commission: 960000,
            paymentStatus: "PAID",
            paidOnTime: true,
        },
        {
            bookingCode: "BK-20260302-008",
            guestName: "Trần Thị Bích",
            room: "Deluxe Double",
            nights: 2,
            amount: 3000000,
            commission: 300000,
            paymentStatus: "PAID",
            paidOnTime: true,
        },
        {
            bookingCode: "BK-20260305-015",
            guestName: "Lê Văn Đức",
            room: "Superior Twin",
            nights: 4,
            amount: 7200000,
            commission: 720000,
            paymentStatus: "PAID",
            paidOnTime: true,
        },
        {
            bookingCode: "BK-20260310-003",
            guestName: "Phạm Ngọc Mai",
            room: "Executive Suite",
            nights: 2,
            amount: 6400000,
            commission: 640000,
            paymentStatus: "PAID",
            paidOnTime: false,
        },
        {
            bookingCode: "BK-20260315-019",
            guestName: "Hoàng Anh Tuấn",
            room: "Deluxe Double",
            nights: 1,
            amount: 1500000,
            commission: 150000,
            paymentStatus: "PAID",
            paidOnTime: false,
        },
    ],
};

// Demo flow steps for Hotel Owner
export const HOTEL_DEMO_STEPS = [
    { key: "dashboard", label: "Dashboard", path: "/demo/hotel/dashboard" },
    { key: "profile", label: "Hồ sơ khách sạn", path: "/demo/hotel/profile" },
    { key: "room-types", label: "Quản lý phòng", path: "/demo/hotel/room-types" },
    { key: "rate-allotment", label: "Lịch tồn kho", path: "/demo/hotel/rate-allotment" },
    { key: "dynamic-pricing", label: "Định giá tự động", path: "/demo/hotel/dynamic-pricing" },
    { key: "revenue-report", label: "Báo cáo doanh thu", path: "/demo/hotel/revenue-report" },
    { key: "payout", label: "Tài chính & Thanh toán", path: "/demo/hotel/payout" },
];
