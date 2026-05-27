import React from "react";
import { Toaster, toast } from "react-hot-toast";

import { RiErrorWarningFill } from "react-icons/ri";

function PopupMessage() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          color: "#fff",
          fontSize: "14px",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          zIndex: 9999,
        },
        success: { style: { background: "rgba(34, 197, 94, 0.35)" } },
        error: { style: { background: "rgba(239, 68, 68, 0.35)" } },
        loading: { style: { background: "rgba(59, 130, 246, 0.35)" } },
        warning: { style: { background: "rgba(234, 179, 8, 0.35)" } },
      }}
    />
  );
}



// Custom warning toast (yellow, icon, smooth)
export const showWarningToast = (message) => {
  toast.custom((t) => (
    <div
      duration={4000}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 15px",
        borderRadius: "10px",
        background: "rgba(255, 193, 7, 0.2)", // yellowish semi-transparent
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 193, 7, 0.3)",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        opacity: t.visible ? 1 : 0,
        transition: "all 0.3s ease",
        minWidth: "250px",
      }}
    >
      {/* Smooth ⚠️ icon */}
      <span
        style={{
          display: "inline-block",
          fontSize: "25px",
          animation: "scaleIcon 0.5s ease-in-out",
          color: "#FFC107",
          backgroundColor: "rgb(255, 255, 255)",
          borderRadius: "50%",
          
        }}
      >
        <RiErrorWarningFill />
      </span>
      <span style={{ flex: 1 }}>{message}</span>

      <style>
        {`
          @keyframes scaleIcon {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  ));
};

export default PopupMessage;
