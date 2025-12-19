import { useEffect, useState } from "react";
import { useSignalR } from "../../contexts/SignalRContext";
import { useAuth } from "../../contexts/AuthContext";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function BanListener() {
    const { subscribe } = useSignalR();
    const { user, logout } = useAuth();
    const [banMessage, setBanMessage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(15);

    useEffect(() => {
        if (!user) return;

        const unsubscribeBanned = subscribe("userbanned", (message: string) => {
            setBanMessage(message);
            setCountdown(15);
        });

        const unsubscribeActivated = subscribe("useractivated", (message: string) => {
            // Optional: Show notification that account is active again if needed
        });

        return () => {
            unsubscribeBanned();
            unsubscribeActivated();
        };
    }, [user, subscribe]);

    useEffect(() => {
        let timer: any;
        if (banMessage && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (banMessage && countdown === 0) {
            setBanMessage(null);
            logout();
        }
        return () => clearInterval(timer);
    }, [banMessage, countdown, logout]);

    if (!banMessage) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
                        <HiOutlineExclamationTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Tài khoản đã bị khóa
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                        {banMessage}
                    </p>

                    <p className="text-sm font-medium text-rose-500 mb-8">
                        Tự động đăng xuất sau {countdown} giây...
                    </p>

                    <button
                        onClick={() => {
                            setBanMessage(null);
                            logout();
                        }}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
                    >
                        Tôi đã hiểu và đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}
