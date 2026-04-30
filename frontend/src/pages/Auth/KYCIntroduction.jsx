import React, { useState, useEffect } from 'react';
import KYCPreparation from '@/components/kyc/KYCPreparation.jsx';
import KYCUploadForm from '@/components/kyc/KYCUploadForm.jsx';
import KYCSuccessView from '@/components/kyc/KYCSuccessView.jsx';
import StepProgressBar from '@/components/common/KYC/StepProgressBar.jsx';
import { kycService } from "@/services/kyc.service.js";
import { useLocation } from 'react-router-dom';
import { RefreshCw} from "lucide-react";

const KYCPage = () => {
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Nếu chuyển hướng từ màn hình danh sách/trạng thái kèm theo ID hồ sơ cũ
        if (location.state?.oldKycId || location.state?.initialData) {
            setCurrentStep(2);
        }
    }, [location]);

    const handleSubmission = async (payload) => {
        setIsSubmitting(true);
        try {
            const { data, files } = payload;

            // data lúc này đã bao gồm verificationId và documentTypes đúng chuẩn
            await kycService.uploadKyc(data, files);

            setCurrentStep(3);
        } catch (error) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi nộp hồ sơ";
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                <StepProgressBar currentStep={currentStep} />

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                    {/* Overlay loading khi đang upload file */}
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
                            <RefreshCw className="animate-spin text-blue-600 mb-2" size={32} />
                            <p className="text-sm font-bold text-slate-600">Đang tải hồ sơ lên hệ thống...</p>
                        </div>
                    )}

                    {currentStep === 1 && <KYCPreparation onStart={() => setCurrentStep(2)} />}

                    {currentStep === 2 && (
                        <KYCUploadForm
                            onBack={() => setCurrentStep(1)}
                            onSubmit={handleSubmission}
                        />
                    )}

                    {currentStep === 3 && <KYCSuccessView />}
                </div>
            </div>
        </div>
    );
};

export default KYCPage;