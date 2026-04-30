import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import ScrollToTop from "./utils/ScrollToTop";
import AppRoutes from "./routes/index";
import ChatbotPopup from "./components/chat/ChatbotPopup.jsx";

function App() {
    const user = JSON.parse(sessionStorage.getItem("user"));

    return (
        <BrowserRouter>
            <AuthContextProvider>
                <ScrollToTop />
                <AppRoutes />

                {user && <ChatbotPopup />}
            </AuthContextProvider>
        </BrowserRouter>
    );
}

export default App;