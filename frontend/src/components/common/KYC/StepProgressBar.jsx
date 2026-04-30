import React from 'react';

const StepProgressBar = ({ currentStep }) => {
    // Danh sách các tiêu đề bước
    const steps = ["1. Chuẩn bị", "2. Upload", "3. Hoàn tất"];

    const getSubtext = (step) => {
        switch (step) {
            case 1: return "Bạn đang ở bước chuẩn bị - hãy đọc kỹ các yêu cầu bên dưới";
            case 2: return "Bạn đang ở bước chuẩn bị - hãy đọc kỹ các yêu cầu bên dưới";
            case 3: return "Hồ sơ của bạn đã được gửi thành công";
            default: return "";
        }
    };

    return (
        <div className="flex flex-col items-center w-full py-4">
            {/* Hàng chứa các Steps và Thanh nối */}
            <div className="flex items-center justify-center gap-6 mb-3">
                {steps.map((step, index) => {
                    const stepIdx = index + 1;
                    const isActive = currentStep === stepIdx;
                    const isCompleted = currentStep > stepIdx;

                    return (
                        <React.Fragment key={step}>
                            {/* Tiêu đề Bước */}
                            <span className={`text-[13px] font-bold whitespace-nowrap transition-colors duration-300 ${
                                (isActive || isCompleted) ? 'text-blue-600' : 'text-slate-400 font-medium'
                            }`}>
                                 {step}
                            </span>

                            {/* Thanh nối (Line) */}
                            {index < steps.length - 1 && (
                                <div className="w-24 h-[1px] bg-slate-200">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-500"
                                        style={{width: isCompleted ? '100%' : '0%'}}
                                    ></div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Dòng chữ hướng dẫn - Căn giữa toàn bộ */}
            <p className="text-[12px] text-slate-400 font-medium tracking-tight">
                {getSubtext(currentStep)}
            </p>
        </div>
    );
};

export default StepProgressBar;