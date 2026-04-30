import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import VerifyOtp from "../pages/Auth/VerifyOtp";
import OAuthCallback from "../pages/Auth/OAuthCallback";
import SelectRole from "../pages/Auth/SelectRole";
import SessionExpiredHandler from "../common/SessionExpiredHandler";
import RoomTypes from "../pages/Hotel/RoomTypes"
import MainLayout from "../components/common/Homepage/MainLayout.jsx";
import HotelMain from "../pages/Hotel/HotelDashboard.jsx"
import DynamicPricing from "../pages/Hotel/DynamicPricing.jsx"
import HotelDetailPage from "@/pages/Hotel/HotelDetail.jsx";
import BookingCheckoutPage from "@/pages/Agency/BookingCheckout.jsx";
import BookingSuccessPage from "@/pages/Agency/BookingSuccess.jsx"
import SearchHotelEngine from "@/pages/Agency/HotelSearchEngine.jsx"
import ListSearchResult from "@/pages/Agency/ListSearchResult.jsx";
import CouponManager from "@/pages/Hotel/CouponManager.jsx";
import AgencyMain from "@/pages/Agency/AgencyDashboard.jsx";
import MyBookingList from "@/pages/Agency/BookingLists.jsx"
import BookingDetailPost from "@/pages/Agency/BookingDetailPost.jsx";
import AddonServiceManager from "@/pages/Hotel/AddonServices.jsx";
import KYCIntroduction from "@/pages/Auth/KYCIntroduction.jsx"
import AdminLayout from "@/pages/Admin/AdminDashboard.jsx";
import KYCQueuePage from "@/pages/Admin/KYCQueue.jsx";
import VerificationStatusPage from "@/pages/Auth/VerificationStatus.jsx";
import ViewAboutUs from "@/pages/common/ViewAboutUs.jsx";
import ViewContact from "@/pages/common/ViewContact.jsx";
import ViewAllBooking from "@/pages/Admin/ViewAllBooking.jsx";
import StaffDashboard from "@/pages/Agency/StaffDashboard.jsx";
import HotelStaffDashboard from "@/pages/Hotel/HotelStaffDashboard.jsx";
import AgencyProfile from "@/pages/Agency/AgencyProfile.jsx";
import HotelProfile from "@/pages/Hotel/HotelProfile.jsx"
import FeedbackHistory from "@/pages/Agency/FeedbackHistory.jsx";
import HotelFeedbackManagement from "@/pages/Hotel/HotelFeedbackManage.jsx";
import FrontDesk from "@/pages/Hotel/FrontDesk.jsx";
import RateAndAllotment from "@/pages/Hotel/RateAndAllotment.jsx";
import UserProfile from "@/pages/common/UserProfile.jsx";
import AdminUserList from "@/pages/Admin/AdminUserList.jsx";
import AdminUserDetail from "@/pages/Admin/AdminUserDetail.jsx";
import AdminBookingDetail from "@/pages/Admin/AdminBookingDetail.jsx";
import PartnerList from "@/pages/Admin/PartnerList.jsx";
import PartnerDetail from "@/pages/Admin/PartnerDetail.jsx";
import PrivatePolicy from "@/pages/common/PrivatePolicy.jsx";
import TermsOfServicePage from "@/pages/common/TermsService.jsx";
import UserGuidePage from "@/pages/common/UserGuide.jsx";
import AgencyDashboardPage from "@/pages/Agency/AgencyDashboardPage.jsx";
import HotelDashboardPage from "@/pages/Hotel/HotelDashboardPage.jsx";
import AdminDashboardPage from "@/pages/Admin/AdminDashboardPage.jsx";
import RegulationPage from "@/pages/common/Regulation.jsx";
import TransactionPage from "@/pages/Admin/AgencyPayTransaction.jsx"
import RankingRulesPage from "@/pages/Admin/RankingRules.jsx"
import RevenueReport from "@/pages/Hotel/RevenueReport.jsx";
import PayoutStatement from "@/pages/Hotel/PayoutStatement.jsx";
import PayoutList from "@/pages/Admin/PayoutList.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import HotelSearchResult from "@/pages/Hotel/HotelSearchResult.jsx"
import RoomTypeDetailList from "@/pages/Hotel/RoomTypeDetailList.jsx"
import PrepaidWallet from "@/pages/Agency/PrepaidWallet.jsx";
import CommissionList from "@/pages/Admin/CommissionList.jsx"
import HotelBookingDetail from "@/pages/Hotel/HotelBookingDetail.jsx"
import { ROLES, ROLE_GROUP } from "../constant/roles.js";
import CreditWallet from "../pages/Agency/CreditWallet.jsx";
import TransactionHistoryPage from "../pages/Agency/TransactionHistoryPage.jsx";
import SystemConfigPage from "@/pages/Admin/SystemConfigPage.jsx";
import SetAgencyRanking from "@/pages/Admin/SetAgencyRanking.jsx"
import AdminBookingDetailById from "@/pages/Admin/AdminBookingDetailById.jsx";
import AdminStaffDashboard from "@/pages/Admin/AdminStaffDashboard.jsx";
import StaffSpendingLimit from "@/pages/Agency/StaffSpendingLimit.jsx";
import DemoLayout from "@/pages/Demo/DemoLayout.jsx";
import DemoDashboard from "@/pages/Demo/hotel/DemoDashboard.jsx";
import DemoProfile from "@/pages/Demo/hotel/DemoProfile.jsx";
import DemoRoomTypes from "@/pages/Demo/hotel/DemoRoomTypes.jsx";
import DemoInventory from "@/pages/Demo/hotel/DemoInventory.jsx";
import DemoDynamicPricing from "@/pages/Demo/hotel/DemoDynamicPricing.jsx";
import DemoRevenueReport from "@/pages/Demo/hotel/DemoRevenueReport.jsx";
import DemoPayout from "@/pages/Demo/hotel/DemoPayout.jsx";
import DemoRoleSelection from "@/pages/Demo/DemoRoleSelection.jsx";
import DemoAgencyLayout from "@/pages/Demo/Agency/DemoAgencyLayout.jsx";
import DemoAgencyDashboard from "@/pages/Demo/Agency/DemoAgencyDashboard.jsx";
import DemoAgencyProfile from "@/pages/Demo/Agency/DemoAgencyProfile.jsx";
import DemoPrepaidWallet from "@/pages/Demo/Agency/DemoPrepaidWallet.jsx";
import DemoCreditWallet from "@/pages/Demo/Agency/DemoCreditWallet.jsx";
import DemoTransactionHistoryPage from "@/pages/Demo/Agency/DemoTransactionHistoryPage.jsx";
import DemoSearchHotel from "@/pages/Demo/Agency/DemoSearchHotel.jsx";
import DemoListSearchResult from "@/pages/Demo/Agency/DemoListSearchResult.jsx";
import HotelDetailPageDemo from "@/pages/Demo/Agency/HotelDetailPageDemo.jsx";
import BookingCheckoutDemo from "@/pages/Demo/Agency/BookingCheckoutDemo.jsx";
import BookingSuccessDemo from "@/pages/Demo/Agency/BookingSuccessDemo.jsx";
import BookingListDemo from "@/pages/Demo/Agency/BookingListDemo.jsx";
import BookingDetailDemo from "@/pages/Demo/Agency/BookingDetailDemo.jsx";
import ViewAuditLogs from "@/pages/Admin/ViewAuditLogs.jsx"
import DisputeManagement from "@/pages/Admin/DisputeManage.jsx";
import PayoutStatementOverview from "@/pages/Admin/PayoutStatementOverview.jsx";

import PartnerAuditLog from "@/pages/Admin/PartnerAuditLog.jsx";
import GlobalChatWidget from "../components/chat/GlobalChatWidget.jsx";

const AppRoutes = () => {
    return (
        <>
            <SessionExpiredHandler />

            <Routes>
                <Route path="/" element={<MainLayout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<MainLayout />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route path="/select-role" element={<SelectRole />} />
                <Route path="/about-us" element={<ViewAboutUs />} />
                <Route path="/contact" element={<ViewContact />} />
                <Route path="/private-policy" element={<PrivatePolicy />} />
                <Route path="/term-service" element={<TermsOfServicePage />} />
                <Route path="/user-guide" element={<UserGuidePage />} />
                <Route path="/regulation" element={<RegulationPage />} />

                <Route path="/kyc-intro" element={<KYCIntroduction />} />
                <Route path="/kyc/status" element={<VerificationStatusPage />} />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>} />

                {/*Luồng Agency Booking*/}
                <Route path="booking-success" element={<BookingSuccessPage />} />
                <Route path="/agency" element={
                    <ProtectedRoute roles={ROLE_GROUP.AGENCY}>
                        <AgencyMain />
                    </ProtectedRoute>
                }>
                    <Route path="search-hotel">
                        <Route index element={<SearchHotelEngine />} />
                        <Route path="list" element={<ListSearchResult />} />
                        <Route path="hotels/:id" element={<HotelDetailPage />} />
                    </Route>
                    <Route path="booking-checkout" element={<BookingCheckoutPage />} />
                    <Route path="booking-list">
                        <Route index element={<MyBookingList />} />
                        <Route path="detail/:id" element={<BookingDetailPost />} />
                    </Route>
                    <Route path="staff" element={<StaffDashboard />} />
                    <Route path="agency-profile" element={<AgencyProfile />} />
                    <Route path="feedback-history" element={<FeedbackHistory />} />
                    <Route path="agency-dashboard" element={<AgencyDashboardPage />} />
                    <Route path="prepaid" element={<PrepaidWallet />} />
                    <Route path="chat-page" element={<GlobalChatWidget />} />
                    <Route path="credit-wallet" element={<CreditWallet />} />
                    <Route path="transaction-history" element={<TransactionHistoryPage />} />
                    <Route path="staff-spending-limit" element={<StaffSpendingLimit />} />
                </Route>

                {/*Luồng Hotel Admin*/}
                <Route
                    path="/hotel"
                    element={
                        <ProtectedRoute roles={ROLE_GROUP.HOTEL}>
                            <HotelMain />
                        </ProtectedRoute>
                    }>
                    <Route path="list-hotel" element={<HotelSearchResult />} />
                    <Route path="list-hotel/hotels/:id" element={<RoomTypeDetailList />} />
                    <Route path="dashboard" element={<HotelDashboardPage />} />
                    <Route path="room-types" element={<RoomTypes />} />
                    <Route index element={<Navigate to="room-types" replace />} />
                    <Route path="dynamic-pricing" element={<DynamicPricing />} />
                    <Route index element={<Navigate to="dynamic-pricing" replace />} />
                    <Route path="coupons" element={<CouponManager />} />
                    <Route index element={<Navigate to="coupons" replace />} />
                    <Route path="staff" element={<HotelStaffDashboard />} />
                    <Route path="profile" element={<HotelProfile />} />
                    <Route path="addon-services" element={<AddonServiceManager />} />
                    <Route path="reviews" element={<HotelFeedbackManagement />} />
                    <Route path="front-desk" element={<FrontDesk/>} />
                    <Route path="rate-allotment" element={<RateAndAllotment/>} />
                    <Route path="chat-page" element={<GlobalChatWidget />} />
                    <Route path="revenue-report" element={<RevenueReport/>} />
                    <Route path="payout-state" element={<PayoutStatement/>} />
                    <Route path="view-booking/:bookingCode" element={<HotelBookingDetail />} />
                </Route>

                {/*Luồng Admin System*/}
                <Route path="/admin"
                    element={
                        <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_ADMIN_STAFF"]}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="kyc-queue" element={<KYCQueuePage />} />
                    <Route path="view-booking" element={<ViewAllBooking />} />
                    <Route path="view-booking/:bookingCode" element={<AdminBookingDetail />} />
                    <Route path="view-booking/:bookingId" element={<AdminBookingDetailById />} />
                    <Route path="partners" element={<PartnerList />} />
                    <Route path="partners/agency/:id" element={<PartnerDetail />} />
                    <Route path="partners/hotel/:id" element={<PartnerDetail />} />
                    <Route path="users" element={<AdminUserList />} />
                    <Route path="users/:userId" element={<AdminUserDetail />} />
                    <Route path="ranking-rules" element={<RankingRulesPage />} />
                    <Route path="set-ranking" element={<SetAgencyRanking />} />
                    <Route path="system-config" element={<SystemConfigPage/>} />
                    <Route path="chat-page" element={<GlobalChatWidget />} />
                    <Route path="staff" element={<AdminStaffDashboard/>} />
                    <Route path="audit-logs" element={<ViewAuditLogs/>} />
                    <Route path="dispute" element={<DisputeManagement/>} />
                    <Route path="partner-audit" element={<PartnerAuditLog/>} />
                    {/*Luồng Admin Financial*/}
                    <Route path="commission" element={<CommissionList />} />
                    <Route path="payment-transaction" element={<TransactionPage />} />
                    <Route path="payout-list" element={<PayoutList />} />
                    <Route path="payout-statements" element={<PayoutStatementOverview />} />

                </Route>

                {/*Luồng Demo*/}
                <Route path="/demo" element={<DemoRoleSelection />} />
                {/*Luồng Demo Agency Manager*/}
                <Route path="/demo-agency" element={<DemoAgencyLayout />}>
                    <Route path="dashboard" element={<DemoAgencyDashboard/>} />
                    <Route path="profile" element={<DemoAgencyProfile/>} />
                    <Route path="prepaid" element={<DemoPrepaidWallet/>} />
                    <Route path="credit" element={<DemoCreditWallet/>} />
                    <Route path="transaction-history" element={<DemoTransactionHistoryPage />} />
                    <Route path="search-hotel">
                        <Route index element={<DemoSearchHotel />} />
                        <Route path="list" element={<DemoListSearchResult />} />
                        <Route path="hotels/:id" element={<HotelDetailPageDemo />} />
                    </Route>
                    <Route path="booking-checkout" element={<BookingCheckoutDemo />} />
                    <Route path="booking-list">
                        <Route index element={<BookingListDemo />} />
                        <Route path="detail/:id" element={<BookingDetailDemo />} />
                    </Route>
                </Route>
                <Route path="demo-agency/booking-success" element={<BookingSuccessDemo />} />

                {/*Demo Mode - Hotel Owner*/}
                <Route path="/demo/hotel" element={<DemoLayout />}>
                    <Route path="dashboard" element={<DemoDashboard />} />
                    <Route path="profile" element={<DemoProfile />} />
                    <Route path="room-types" element={<DemoRoomTypes />} />
                    <Route path="rate-allotment" element={<DemoInventory />} />
                    <Route path="dynamic-pricing" element={<DemoDynamicPricing />} />
                    <Route path="revenue-report" element={<DemoRevenueReport />} />
                    <Route path="payout" element={<DemoPayout />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default AppRoutes;