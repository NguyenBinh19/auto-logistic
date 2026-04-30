import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const FilterHeader = ({ activeTab, setActiveTab, currentDate, setCurrentDate, today }) => {
    const changeDate = (days) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + days);
        setCurrentDate(date.toISOString().split('T')[0]);
    };

    const tabs = [
        { id: 'arrival', label: 'Khách đến' },
        { id: 'departure', label: 'Khách đi' },
        // { id: 'stay', label: 'Đang lưu trú' }
    ];

    return (
        <div className="p-6 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6 bg-white">
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <ChevronLeft size={18} className="text-slate-600" />
                    </button>
                    <div className="relative px-2">
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="bg-transparent font-black text-xs uppercase outline-none cursor-pointer px-2"
                        />
                    </div>
                    <button onClick={() => changeDate(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <ChevronRight size={18} className="text-slate-600" />
                    </button>
                </div>
                <button
                    onClick={() => setCurrentDate(today)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        currentDate === today
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                >
                    Hôm nay
                </button>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1 border border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterHeader;