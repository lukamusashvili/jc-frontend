import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Finances from "./pages/Finances";
import WalletTransactions from "./pages/Finances/WalletTransactions";
import DeletedProducts from "./pages/Products/DeletedProducts";
import DeletedTransactions from "./pages/Finances/DeletedTransactions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
    // <ConfigProvider
    //     theme={{
    //         token: {
    //             colorPrimary: "var(--color-black)",
    //             colorText: "var(--color-black)",
    //             colorIcon: "var(--color-black)",
    //             colorBorder: "var(--color-black)",
    //             colorBgContainer: "var(--color-black)",
    //         },
    //     }}
    // >
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/products/deleted" element={<DeletedProducts />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/finances/:id" element={<WalletTransactions />} />
            <Route path="/finances/:id/deleted" element={<DeletedTransactions />} />
        </Routes>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    </BrowserRouter>
    /* </ConfigProvider> */
);
