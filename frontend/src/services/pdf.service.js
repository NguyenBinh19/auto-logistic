import api from "./axios.config.js";

// Upload File PDF
const uploadPdf = async (file, title, description = "") => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        if (description) {
            formData.append("description", description);
        }

        const response = await api.post(`/pdf-documents`, formData);
        return response.data;
    } catch (error) {
        console.error("Upload PDF Error:", error);
        throw error;
    }
};

// Xem chi tiết File
const getPdfById = async (documentId) => {
    try {
        const response = await api.get(`/pdf-documents/${documentId}`);
        return response.data;
    } catch (error) {
        console.error("Get PDF Detail Error:", error);
        throw error;
    }
};

// Get All File
const getAllPdfs = async () => {
    try {
        const response = await api.get(`/pdf-documents`);
        return response.data;
    } catch (error) {
        console.error("Get All PDFs Error:", error);
        throw error;
    }
};

// Update File PDF
const updatePdf = async (documentId, payload) => {
    try {
        const response = await api.put(`/pdf-documents/${documentId}`, payload);
        return response.data;
    } catch (error) {
        console.error("Update PDF Error:", error);
        throw error;
    }
};

// Xóa File PDF
const deletePdf = async (documentId) => {
    try {
        const response = await api.delete(`/pdf-documents/${documentId}`);
        return response.data;
    } catch (error) {
        console.error("Delete PDF Error:", error);
        throw error;
    }
};

export const pdfDocumentService = {
    uploadPdf,
    getPdfById,
    getAllPdfs,
    updatePdf,
    deletePdf
};