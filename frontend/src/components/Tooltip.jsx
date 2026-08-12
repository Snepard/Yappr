import { useState } from "react";
import { createPortal } from "react-dom";

const Tooltip = ({ children, label, position = "top" }) => {
  const [coords, setCoords] = useState(null);
  const [visible, setVisible] = useState(false);

  const handleMouseEnter = (e) => {
    if (e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  if (!label) return children;

  let tooltipStyle = {};
  if (coords) {
    if (position === "right") {
      tooltipStyle = {
        top: `${coords.top + coords.height / 2}px`,
        left: `${coords.right + 10}px`,
        transform: "translateY(-50%)",
      };
    } else if (position === "left") {
      tooltipStyle = {
        top: `${coords.top + coords.height / 2}px`,
        left: `${coords.left - 10}px`,
        transform: "translate(-100%, -50%)",
      };
    } else if (position === "top") {
      tooltipStyle = {
        top: `${coords.top - 10}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: "translate(-50%, -100%)",
      };
    } else if (position === "bottom") {
      tooltipStyle = {
        top: `${coords.bottom + 10}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: "translate(-50%, 0)",
      };
    }
  }

  const tooltipElement = visible && coords ? (
    <div
      style={tooltipStyle}
      className="fixed px-3 py-1.5 bg-[#111214] text-white text-[12px] font-bold rounded-xl shadow-2xl backdrop-blur-md whitespace-nowrap z-[999999] pointer-events-none transition-all duration-150 ease-out flex items-center justify-center select-none animate-in fade-in zoom-in-95"
    >
      {/* Discord-style Arrow Pointer */}
      {position === "right" && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
      )}
      {position === "left" && (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
      )}
      {position === "top" && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
      )}
      {position === "bottom" && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
      )}

      <span className="relative z-10">{label}</span>
    </div>
  ) : null;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center justify-center"
    >
      {children}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </div>
  );
};

export default Tooltip;
