import api from "./axios.config.js";

// 1. Upload File
const uploadFile = async (file) =>{
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post('/storage/upload', formData, {
            headers: {
                // Ghi đè Content-type để axios tự định nghĩa boundary cho FormData
                "Content-Type": "multipart/form-data",
            }
        });
        return response.data;
    } catch (error) {
        console.error("Upload Error:", error.response?.data || error.message);
        throw error;
    }
}

// 2. Download File
const downloadFile = async (file) =>{
    try {
        const response = await api.get('/storage/download/${filename}', {
            responseType: 'blob', // yêu cầu axios trả về dạng Blob (binary)
        });
        // Xử lý tạo link tải xuống tự động trên trình duyệt
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        // Thiết lập tên file khi lưu về máy
        link.setAttribute("download", filename);

        document.body.appendChild(link);
        link.click();

        // Dọn dẹp bộ nhớ sau khi tải
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error("S3 Download Error:", error.response?.data || error.message);
        throw error;
    }
};

export const s3Service = {
    uploadFile,
    downloadFile,
};
