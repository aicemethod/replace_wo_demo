import React from "react";
import "../styles/components/Spinner.css";

/**
 * シンプルなローディングスピナーコンポーネント
 */
export const Spinner: React.FC<{ size?: "small" | "medium" | "large" }> = ({ 
    size = "medium" 
}) => {
    return (
        <div className={`spinner-container spinner-${size}`}>
            <div className="spinner-ring"></div>
        </div>
    );
};
