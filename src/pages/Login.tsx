import React from "react";
import { useNavigate } from "react-router";
import { useSnapshot } from "valtio";
import { toast } from "react-toastify";
import { login } from "../actions/auth";
import { authState, appState } from "../states";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

const Login = () => {
    const navigate = useNavigate();
    const snap = useSnapshot(authState);

    const handleInputChange = (field: string) => (value: string) => {
        authState.credentials[field as keyof typeof authState.credentials] =
            value;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!snap.credentials.user || !snap.credentials.password) {
            toast.error("გთხოვთ შეიყვანოთ მომხმარებლის სახელი და პაროლი");
            return;
        }

        try {
            const response = await login(snap.credentials);
            toast.success(response.message);
            navigate("/");
        } catch (error: any) {
            toast.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-light)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--color-white)] py-8 px-4 shadow sm:rounded-lg sm:px-10 gap-12 flex flex-col border border-[var(--color-bg-light)]">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="flex justify-center">
                            <img
                                className="mx-auto h-20 w-auto"
                                src="/logo.png"
                                alt="Logo"
                            />
                        </div>
                        <h2 className="mt-6 text-center text-2xl font-extrabold text-[var(--color-black)]">
                            ავტორიზაცია
                        </h2>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <Input
                                label="მომხმარებლის სახელი"
                                type="text"
                                value={snap.credentials.user}
                                onChange={handleInputChange("user")}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="პაროლი"
                                type="password"
                                value={snap.credentials.password}
                                onChange={handleInputChange("password")}
                                required
                            />
                        </div>

                        <div>
                            <Button
                                title={
                                    appState.loading ? "იტვირთება..." : "შესვლა"
                                }
                                onClick={() => handleSubmit}
                                type={appState.loading ? "disabled" : "gold"}
                                customClasses="w-full"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
