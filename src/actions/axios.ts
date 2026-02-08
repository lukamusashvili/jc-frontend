import axios, { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

export async function axiosRequest(config: AxiosRequestConfig) {
    const token = localStorage.getItem("token");

    if (!token && config.url !== "/login") {
        toast.error("გთხოვთ გაიაროთ ავტორიზაცია.");
        throw new Error("Authentication required");
    }

    try {
        const fullUrl = `http://localhost:3000${config.url}`;

        const response = await axios({
            ...config,
            url: fullUrl,
            headers: {
                ...config.headers,
                token: token,
            },
        });

        return response.data;
    } catch (error: any) {
        throw error;
    }
}
