import React from "react";
import Modal from "./Modal";
import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy bỏ",
    type = "danger",
    isLoading = false,
}) => {
    const colors = {
        danger: {
            icon: "text-red-500 bg-red-100",
            button: "bg-red-500 hover:bg-red-600",
            focus: "focus:ring-red-500",
        },
        warning: {
            icon: "text-yellow-500 bg-yellow-100",
            button: "bg-yellow-500 hover:bg-yellow-600",
            focus: "focus:ring-yellow-500",
        },
        info: {
            icon: "text-blue-500 bg-blue-100",
            button: "bg-blue-500 hover:bg-blue-600",
            focus: "focus:ring-blue-500",
        },
    };

    const currentColors = colors[type];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
            <div className="flex flex-col items-center text-center space-y-4">
                <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${currentColors.icon} mb-2`}
                >
                    <FaExclamationTriangle className="text-3xl" />
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">{message}</p>

                <div className="flex gap-3 w-full mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${currentColors.button}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
