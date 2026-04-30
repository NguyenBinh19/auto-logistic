import React, { createContext, useContext, useState } from "react";

const CompareContext = createContext();
export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleCompareItem = (hotel) => {
        setCompareItems((prev) => {
            const isExist = prev.find((item) => item.hotelId === hotel.hotelId);
            if (isExist) return prev.filter((item) => item.hotelId !== hotel.hotelId);

            if (prev.length >= 4) {
                alert("Bạn chỉ có thể chọn tối đa 4 khách sạn để so sánh.");
                return prev;
            }
            return [...prev, hotel];
        });
    };

    const removeItem = (id) => setCompareItems(prev => prev.filter(item => item.hotelId !== id));
    const clearAll = () => setCompareItems([]);

    const handleCompareNow = () => {
        if (compareItems.length < 2) {
            alert("Vui lòng chọn ít nhất 2 khách sạn để so sánh.");
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <CompareContext.Provider value={{
            compareItems, toggleCompareItem, removeItem, clearAll,
            isModalOpen, setIsModalOpen, handleCompareNow
        }}>
            {children}
        </CompareContext.Provider>
    );
};