// import React, { useState } from 'react';
// import { ArrowRight, Zap, Trash2, Edit2, AlertTriangle, ShieldCheck } from 'lucide-react';

// const OccupancyRules = () => {
//     // Mapping DB: room_pricing_rules WHERE rule_type = 'OCCUPANCY'
//     const [occupancyRules, setOccupancyRules] = useState([
//         {
//             rule_id: 1,
//             rule_name: 'Luật #1',
//             condition: 'Còn lại <= 5 phòng',
//             action: 'Tăng giá 5%',
//             is_active: true,
//             updated_at: 'Just now'
//         },
//         {
//             rule_id: 2,
//             rule_name: 'Luật #2',
//             condition: 'Còn lại <= 2 phòng',
//             action: 'Tăng giá 15%',
//             is_active: true,
//             updated_at: 'Just now'
//         }
//     ]);

//     return (
//         <div>
//             <h2 className="text-lg font-bold text-gray-800 mb-2">Luật theo Công suất</h2>
//             <p className="text-sm text-gray-500 mb-6">Tạo luật tự động điều chỉnh giá dựa trên mức tồn kho</p>

//             {/* BUILDER SECTION */}
//             <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
//                 <h3 className="font-bold text-gray-800 mb-4">Bộ dựng luật</h3>

//                 <div className="flex items-center gap-4 mb-6 relative">
//                     {/* IF Block */}
//                     <div className="flex-1">
//                         <div className="mb-2 font-semibold text-gray-600 text-sm">NẾU</div>
//                         <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
//                             <label className="text-xs text-gray-500 mb-1 block">Số lượng phòng trống còn lại</label>
//                             <div className="space-y-2">
//                                 <select className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-sm">
//                                     <option>Còn lại &lt;=</option>
//                                     <option>Còn lại &gt;=</option>
//                                 </select>
//                                 <input type="number" placeholder="2" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Arrow */}
//                     <div className="flex flex-col items-center pt-6 text-gray-400">
//                         <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full mb-2 flex items-center gap-1 shadow-md hover:bg-blue-700">
//                             <Zap size={12} fill="currentColor"/> Nếu... Thì...
//                         </button>
//                         <ArrowRight size={24} />
//                     </div>

//                     {/* THEN Block */}
//                     <div className="flex-1">
//                         <div className="mb-2 font-semibold text-gray-600 text-sm">THÌ</div>
//                         <div className="border border-gray-300 rounded-lg p-4 bg-white">
//                             <label className="text-xs text-gray-500 mb-1 block">Điều chỉnh giá</label>
//                             <div className="space-y-2">
//                                 <select className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-sm">
//                                     <option>Tăng giá</option>
//                                     <option>Giảm giá</option>
//                                 </select>
//                                 <div className="flex gap-2">
//                                     <input type="number" placeholder="15" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
//                                     <span className="flex items-center px-3 border border-gray-300 rounded bg-gray-50 text-gray-600">%</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Filters */}
//                 <div className="grid grid-cols-2 gap-4 mb-6 w-2/3">
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 uppercase mb-1">Áp dụng cho</label>
//                         <div className="flex items-center gap-2">
//                             <span className="text-sm text-gray-600 whitespace-nowrap">Trong vòng</span>
//                             <input type="number" defaultValue={7} className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
//                             <span className="text-sm text-gray-600">ngày</span>
//                         </div>
//                     </div>
//                     <div>
//                         <label className="text-xs font-bold text-gray-500 uppercase mb-1">Cho loại phòng</label>
//                         <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
//                             <option>All Room Types</option>
//                             <option>Deluxe Only</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div className="flex justify-end">
//                     <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
//                         Tạo Luật
//                     </button>
//                 </div>
//             </div>

//             {/* ACTIVE RULES LIST */}
//             <h3 className="font-bold text-gray-800 mb-3">Các luật đang hoạt động</h3>
//             <div className="space-y-3 mb-8">
//                 {occupancyRules.map(rule => (
//                     <div key={rule.rule_id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
//                         <div className="flex gap-4 items-center">
//                             <div className={`w-10 h-6 rounded-full p-1 transition-colors ${rule.is_active ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                                 <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${rule.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
//                             </div>
//                             <div>
//                                 <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
//                                     {rule.rule_name}
//                                     <span className="font-normal text-gray-500 text-xs">
//                                 Nếu {rule.condition.toLowerCase()} &rarr; {rule.action}
//                             </span>
//                                 </div>
//                                 <div className="text-xs text-gray-500 mt-1">
//                                     Áp dụng cho: Tất cả loại phòng • Trong vòng 7 ngày
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-4">
//                             <span className="text-xs text-gray-400">Last updated: {rule.updated_at}</span>
//                             <div className="flex gap-1">
//                                 <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 size={16}/></button>
//                                 <button className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={16}/></button>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* SAFETY NET (Cơ chế an toàn) */}
//             <div className="mb-8">
//                 <h3 className="font-bold text-gray-800 mb-3">Cơ chế an toàn</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
//                         <div className="flex items-center gap-2 mb-2 border-l-4 border-blue-600 pl-3">
//                             <h4 className="font-bold text-gray-800">Giá trần</h4>
//                         </div>
//                         <p className="text-xs text-gray-500 mb-3">Giá cao nhất được phép cho bất kỳ loại phòng nào</p>
//                         <div className="flex items-center gap-2 mb-2">
//                             <span className="font-medium text-gray-700 whitespace-nowrap w-16">Giá trần:</span>
//                             <div className="relative w-full">
//                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₫</span>
//                                 <input type="text" defaultValue="5000000" className="w-full pl-6 border border-white focus:border-blue-300 shadow-sm rounded px-3 py-2" />
//                             </div>
//                         </div>
//                         <p className="text-[10px] text-gray-400">Ngăn chặn thuật toán đặt giá quá cao gây phản cảm</p>
//                     </div>

//                     <div className="bg-green-50 border border-green-100 rounded-lg p-5">
//                         <div className="flex items-center gap-2 mb-2 border-l-4 border-green-500 pl-3">
//                             <h4 className="font-bold text-gray-800">Giá sàn</h4>
//                         </div>
//                         <p className="text-xs text-gray-500 mb-3">Giá thấp nhất được phép cho bất kỳ loại phòng nào</p>
//                         <div className="flex items-center gap-2 mb-2">
//                             <span className="font-medium text-gray-700 whitespace-nowrap w-16">Giá sàn:</span>
//                             <div className="relative w-full">
//                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₫</span>
//                                 <input type="text" defaultValue="1200000" className="w-full pl-6 border border-white focus:border-green-300 shadow-sm rounded px-3 py-2" />
//                             </div>
//                         </div>
//                         <p className="text-[10px] text-gray-400">Đảm bảo lợi nhuận bằng cách ngăn chặn giá dưới giá vốn</p>
//                     </div>
//                 </div>
//             </div>

//             {/* CONFLICT WARNING */}
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
//                 <AlertTriangle className="text-yellow-600 shrink-0 mt-1" size={20} />
//                 <div>
//                     <h4 className="text-sm font-bold text-yellow-800 mb-1">Phát hiện xung đột</h4>
//                     <p className="text-xs text-yellow-700 mb-2 leading-relaxed">
//                         Luật bạn đang tạo xung đột với <b>Luật #1</b>. Cả hai luật đều áp dụng khi còn &lt;= 5 phòng.<br/>
//                         Bạn có muốn ghi đè Luật #1 hay tạo luật mới với điều kiện đã điều chỉnh?
//                     </p>
//                     <div className="flex gap-2">
//                         <button className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-xs px-3 py-1.5 rounded font-medium">Ghi đè Luật #1</button>
//                         <button className="bg-white border border-yellow-200 hover:bg-gray-50 text-yellow-800 text-xs px-3 py-1.5 rounded font-medium">Điều chỉnh điều kiện</button>
//                     </div>
//                 </div>
//             </div>

//         </div>
//     );
// };

// export default OccupancyRules;