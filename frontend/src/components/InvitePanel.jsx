import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  Copy,
  Check,
  UserPlus,
  MessageCircle,
  Mail,
  Download,
  Link2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { generateQRCodeMatrix } from "../lib/qrCode";

export const InvitePanel = () => {
  const { authUser } = useAuthStore();
  const { setIsInviteOpen } = useChatStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [copied, setCopied] = useState(false);
  const [showLinkSection, setShowLinkSection] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tearState, setTearState] = useState("idle"); // "idle" | "tearing" | "flying" | "done"
  const passRef = useRef(null);

  const handleUsername =
    authUser?.username || authUser?.email?.split("@")[0] || "friend";
  const userDisplayName = authUser?.fullName || authUser?.name || handleUsername;
  const userProfilePic = authUser?.profilePic || "/avatar.png";
  const inviteUrl = `${window.location.origin}/signup?ref=${encodeURIComponent(handleUsername)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy invite link");
    }
  };

  const handleToggleLink = () => {
    setShowLinkSection((prev) => !prev);
    if (!showLinkSection) {
      handleCopyLink();
    }
  };

  const handleShare = (platform) => {
    const text = `Join me on YAPPR! Connect and chat: ${inviteUrl}`;
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        break;
      case "gmail":
        shareUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${encodeURIComponent(
          "Join me on YAPPR!"
        )}&body=${encodeURIComponent(text)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const qrMatrix = useMemo(() => {
    try {
      return generateQRCodeMatrix(inviteUrl);
    } catch (e) {
      console.error("QR Generation Error:", e);
      return [];
    }
  }, [inviteUrl]);

  const loadCanvasImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const doActualDownload = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Landscape orientation canvas matching the original landscape design
    const width = 1000;
    const height = 480;
    const stubX = 670;

    canvas.width = width;
    canvas.height = height;

    const [logoImg, pfpImg] = await Promise.all([
      loadCanvasImage("/YapprIcon.png"),
      loadCanvasImage(userProfilePic),
    ]);

    // 1. Background Fill
    if (isNeubrutalism) {
      ctx.fillStyle = "#FFE600";
      ctx.fillRect(0, 0, width, height);
      ctx.lineWidth = 12;
      ctx.strokeStyle = "#000000";
      ctx.strokeRect(6, 6, width - 12, height - 12);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#080d1a");
      bgGrad.addColorStop(0.5, "#0f172a");
      bgGrad.addColorStop(1, "#192438");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Radial glow behind left section
      const radialGlow = ctx.createRadialGradient(280, 240, 30, 280, 240, 380);
      radialGlow.addColorStop(0, "rgba(14, 165, 233, 0.18)");
      radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Outer borders
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3.5;
      ctx.strokeRect(2, 2, width - 4, height - 4);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(9, 9, width - 18, height - 18);
    }

    // 2. Top-to-Bottom Tear Perforation Line & Notches on Canvas
    const notchRadius = 20;

    // Dashed perforation line from top to bottom
    ctx.strokeStyle = isNeubrutalism ? "rgba(0, 0, 0, 0.35)" : "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(stubX, notchRadius);
    ctx.lineTo(stubX, height - notchRadius);
    ctx.stroke();
    ctx.setLineDash([]);

    // Top Notch cutout
    ctx.fillStyle = isNeubrutalism ? "#FFFFFF" : "#050914";
    ctx.beginPath();
    ctx.arc(stubX, 0, notchRadius, 0, Math.PI * 2);
    ctx.fill();
    if (isNeubrutalism) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.stroke();
    }

    // Bottom Notch cutout
    ctx.beginPath();
    ctx.arc(stubX, height, notchRadius, 0, Math.PI * 2);
    ctx.fill();
    if (isNeubrutalism) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.stroke();
    }

    // 3. Left Section: YAPPR Branding, Sender Info & Text
    const leftPad = 50;

    // Header logo + text
    const logoBoxSize = 44;
    const logoBoxY = 46;
    if (logoImg) {
      ctx.drawImage(logoImg, leftPad, logoBoxY, logoBoxSize, logoBoxSize);
    } else {
      ctx.fillStyle = isNeubrutalism ? "#000000" : "#2563eb";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(leftPad, logoBoxY, logoBoxSize, logoBoxSize, 10);
        ctx.fill();
      } else {
        ctx.fillRect(leftPad, logoBoxY, logoBoxSize, logoBoxSize);
      }
      ctx.fillStyle = isNeubrutalism ? "#FFE600" : "#ffffff";
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Y", leftPad + logoBoxSize / 2, logoBoxY + 30);
    }

    ctx.fillStyle = isNeubrutalism ? "#000000" : "#ffffff";
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("YAPPR", leftPad + logoBoxSize + 14, logoBoxY + 32);

    // Sender Card Block
    const senderCardY = 120;
    const senderCardH = 130;
    const senderCardW = stubX - leftPad - 40;

    ctx.fillStyle = isNeubrutalism ? "#FFFFFF" : "rgba(255, 255, 255, 0.06)";
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(leftPad, senderCardY, senderCardW, senderCardH, 18);
      ctx.fill();
    } else {
      ctx.fillRect(leftPad, senderCardY, senderCardW, senderCardH);
    }

    if (isNeubrutalism) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3.5;
      ctx.strokeRect(leftPad, senderCardY, senderCardW, senderCardH);
    } else {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.5;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(leftPad, senderCardY, senderCardW, senderCardH, 18);
        ctx.stroke();
      }
    }

    // Avatar
    const avatarR = 36;
    const avatarCX = leftPad + 22 + avatarR;
    const avatarCY = senderCardY + senderCardH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.clip();

    if (pfpImg) {
      ctx.drawImage(pfpImg, avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
    } else {
      ctx.fillStyle = isNeubrutalism ? "#000000" : "#0284c7";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      const initial = (userDisplayName || handleUsername).charAt(0).toUpperCase();
      ctx.fillText(initial, avatarCX, avatarCY + 11);
    }
    ctx.restore();

    ctx.strokeStyle = isNeubrutalism ? "#000000" : "#38bdf8";
    ctx.lineWidth = isNeubrutalism ? 3 : 2.5;
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.stroke();

    // Names
    ctx.textAlign = "left";
    ctx.fillStyle = isNeubrutalism ? "#000000" : "#ffffff";
    ctx.font = "bold 26px system-ui, sans-serif";
    ctx.fillText(userDisplayName, avatarCX + avatarR + 18, avatarCY - 7);

    ctx.fillStyle = isNeubrutalism ? "#000000" : "#38bdf8";
    ctx.font = "bold 17px monospace";
    ctx.fillText(`@${handleUsername}`, avatarCX + avatarR + 18, avatarCY + 22);

    // Invite Message
    ctx.fillStyle = isNeubrutalism ? "#000000" : "#f1f5f9";
    ctx.font = "bold 21px system-ui, sans-serif";
    ctx.fillText(`${userDisplayName} has invited you to yap together!`, leftPad, 305);

    // Bottom info
    ctx.fillStyle = isNeubrutalism ? "#000000" : "#94a3b8";
    ctx.font = "500 15px system-ui, sans-serif";
    ctx.fillText("Scan QR code with your phone camera to join and chat", leftPad, 375);

    ctx.fillStyle = isNeubrutalism ? "rgba(0,0,0,0.7)" : "#38bdf8";
    ctx.font = "bold 13px monospace";
    ctx.fillText(inviteUrl, leftPad, 410);

    // 4. Right Stub Section: QR Code Box
    const stubWidth = width - stubX;
    const qrBoxSize = 270;
    const qrBoxX = stubX + (stubWidth - qrBoxSize) / 2;
    const qrBoxY = (height - qrBoxSize) / 2 - 12;

    ctx.fillStyle = "#ffffff";
    if (isNeubrutalism) {
      ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#000000";
      ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    } else {
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 22);
        ctx.fill();
      } else {
        ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      }
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2.5;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 22);
        ctx.stroke();
      }
    }

    // Draw QR Modules
    if (qrMatrix.length > 0) {
      const moduleCount = qrMatrix.length;
      const innerPad = 16;
      const drawArea = qrBoxSize - innerPad * 2;
      const moduleSize = drawArea / moduleCount;

      ctx.fillStyle = "#000000";
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qrMatrix[r][c]) {
            ctx.fillRect(
              qrBoxX + innerPad + c * moduleSize,
              qrBoxY + innerPad + r * moduleSize,
              moduleSize + 0.35,
              moduleSize + 0.35
            );
          }
        }
      }
    }

    // Mini Center Box on QR
    const centerBoxSize = 44;
    const centerX = qrBoxX + (qrBoxSize - centerBoxSize) / 2;
    const centerY = qrBoxY + (qrBoxSize - centerBoxSize) / 2;

    if (logoImg) {
      ctx.fillStyle = "#ffffff";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(centerX, centerY, centerBoxSize, centerBoxSize, 8);
        ctx.fill();
      } else {
        ctx.fillRect(centerX, centerY, centerBoxSize, centerBoxSize);
      }
      ctx.drawImage(logoImg, centerX + 4, centerY + 4, centerBoxSize - 8, centerBoxSize - 8);
    } else {
      ctx.fillStyle = isNeubrutalism ? "#FFE600" : "#0f172a";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(centerX, centerY, centerBoxSize, centerBoxSize, 8);
        ctx.fill();
      } else {
        ctx.fillRect(centerX, centerY, centerBoxSize, centerBoxSize);
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Y", centerX + centerBoxSize / 2, centerY + 30);
    }

    ctx.strokeStyle = isNeubrutalism ? "#000000" : "#0284c7";
    ctx.lineWidth = 2;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(centerX, centerY, centerBoxSize, centerBoxSize, 8);
      ctx.stroke();
    } else {
      ctx.strokeRect(centerX, centerY, centerBoxSize, centerBoxSize);
    }

    // Stub label under QR
    ctx.fillStyle = isNeubrutalism ? "#000000" : "#94a3b8";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO CONNECT", stubX + stubWidth / 2, qrBoxY + qrBoxSize + 30);

    // Download image file
    const link = document.createElement("a");
    link.download = `YAPPR-Invite-${handleUsername}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [isNeubrutalism, userProfilePic, userDisplayName, handleUsername, inviteUrl, qrMatrix]);

  const handleDownloadQR = async () => {
    if (tearState !== "idle") return;
    try {
      setIsDownloading(true);
      setTearState("tearing");

      // Phase 1: Realistic tear gap opens with particle flutter (450ms)
      await new Promise((r) => setTimeout(r, 450));

      // Phase 2: Stub tears completely and swooshes down toward device (750ms)
      setTearState("flying");

      // Trigger the file download
      await doActualDownload();
      await new Promise((r) => setTimeout(r, 750));

      // Phase 3: Done feedback
      setTearState("done");
      toast.success("Pass downloaded successfully!");
      await new Promise((r) => setTimeout(r, 600));

      // Phase 4: Reset back to intact ticket
      setTearState("idle");
    } catch (e) {
      console.error(e);
      toast.error("Failed to download pass");
      setTearState("idle");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col sm:items-center sm:justify-center p-0 sm:p-5 md:p-8 transition-all overflow-hidden h-full w-full ${
        isNeubrutalism
          ? "bg-[#FFFDF0] text-black"
          : "bg-gradient-to-br from-slate-50/70 via-blue-50/40 to-sky-50/60 backdrop-blur-xl"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={`relative w-full h-full sm:h-auto sm:max-h-[88vh] max-w-2xl lg:max-w-3xl flex flex-col transition-all overflow-hidden ${
          isNeubrutalism
            ? "bg-white border-0 sm:border-4 border-black shadow-none sm:shadow-[10px_10px_0_#000] rounded-none text-black"
            : "bg-white/95 sm:bg-white/90 sm:backdrop-blur-2xl sm:backdrop-saturate-200 rounded-none sm:rounded-3xl shadow-none sm:shadow-[0_25px_70px_rgba(14,165,233,0.18)] border-0 sm:border sm:border-white/95 sm:ring-1 sm:ring-sky-500/15"
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-5 py-5 sm:px-8 sm:py-6 min-h-[76px] sm:min-h-[88px] relative flex-shrink-0 flex items-center justify-between gap-4 ${
            isNeubrutalism
              ? "bg-[#FFE600] text-black border-b-2 sm:border-b-4 border-black"
              : "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white border-b border-white/15 shadow-sm"
          }`}
        >
          {!isNeubrutalism && (
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          )}

          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            <div
              className={`w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center shrink-0 ${
                isNeubrutalism
                  ? "bg-black text-white border-2 sm:border-3 border-black shadow-[2px_2px_0_#000] rounded-none"
                  : "bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner"
              }`}
            >
              <UserPlus className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h2
                className={`text-lg sm:text-2xl font-black tracking-tight truncate ${
                  isNeubrutalism ? "uppercase text-black" : "text-white"
                }`}
              >
                Invite Friends
              </h2>
              <p
                className={`text-xs sm:text-sm truncate mt-0.5 sm:mt-1 ${
                  isNeubrutalism ? "text-black/80 font-bold" : "text-blue-100 font-medium"
                }`}
              >
                Share your personal link or QR pass to connect on YAPPR
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInviteOpen(false)}
            className={`p-2.5 sm:p-3 transition-all cursor-pointer shrink-0 ${
              isNeubrutalism
                ? "bg-black text-white border-2 border-black hover:bg-[#FF007A] rounded-none shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
                : "rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/25 text-white hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
            }`}
            title="Close"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* ═════ PASS CARD (PORTRAIT ON MOBILE, LANDSCAPE ON DESKTOP) ═════ */}
          <div ref={passRef} className="relative select-none mx-auto w-full max-w-sm sm:max-w-none">
            <div className="relative flex flex-col sm:flex-row items-stretch overflow-visible">
              {/* PIECE 1: QR CODE PIECE (Top on Mobile, Right on Desktop) */}
              <motion.div
                animate={
                  isMobile
                    ? tearState === "flying"
                      ? { y: 380, x: 20, rotate: 18, scale: 0.55, opacity: 0 }
                      : tearState === "tearing"
                      ? { y: -12, x: 2, rotate: -2, opacity: 1 }
                      : tearState === "done"
                      ? { y: 0, x: 0, rotate: 0, scale: 1, opacity: 0 }
                      : { y: 0, x: 0, rotate: 0, scale: 1, opacity: 1 }
                    : tearState === "flying"
                    ? { x: 80, y: 260, rotate: 22, scale: 0.62, opacity: 0 }
                    : tearState === "tearing"
                    ? { x: 12, y: 5, rotate: 2.8, opacity: 1 }
                    : tearState === "done"
                    ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0 }
                    : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
                }
                transition={
                  tearState === "flying"
                    ? { duration: 0.8, ease: [0.32, 0, 0.67, 0] }
                    : tearState === "done"
                    ? { duration: 0 }
                    : { duration: 0.4, ease: "easeOut" }
                }
                style={{ originX: 0, originY: 0 }}
                className={`order-1 sm:order-2 relative shrink-0 overflow-hidden flex flex-col items-center justify-center py-7 px-5 sm:p-5 md:p-6 z-20 transition-all ${
                  isNeubrutalism
                    ? "bg-[#FFE600] border-2 sm:border-4 border-b-0 sm:border-b-4 sm:border-l-0 border-black shadow-[4px_4px_0_#000] sm:shadow-[6px_6px_0_#000] rounded-t-2xl sm:rounded-t-none sm:rounded-r-3xl text-black"
                    : "bg-gradient-to-b sm:bg-gradient-to-r from-[#0d1627] via-[#121c2e] to-[#162237] text-white border-2 border-b-0 sm:border-b-2 sm:border-l-0 border-sky-400/40 rounded-t-2xl sm:rounded-t-none sm:rounded-r-3xl shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
                }`}
              >
                {/* Top reflective highlight */}
                {!isNeubrutalism && (
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-sky-400/40 via-sky-400/25 to-transparent pointer-events-none" />
                )}

                {/* Bottom-Left Notch Cutout (Active on both mobile and desktop) */}
                <div
                  className={`absolute -bottom-3 -left-3 w-6 h-6 rounded-full z-20 pointer-events-none ${
                    isNeubrutalism
                      ? "bg-white border-2 border-black"
                      : "bg-[#f8fafc] ring-1 ring-sky-400/30 shadow-inner"
                  }`}
                  style={{ backgroundColor: isNeubrutalism ? "#FFFFFF" : "#f8fafc" }}
                />

                {/* Bottom-Right Notch Cutout (Mobile only) */}
                <div
                  className={`block sm:hidden absolute -bottom-3 -right-3 w-6 h-6 rounded-full z-20 pointer-events-none ${
                    isNeubrutalism
                      ? "bg-white border-2 border-black"
                      : "bg-[#f8fafc] ring-1 ring-sky-400/30 shadow-inner"
                  }`}
                  style={{ backgroundColor: isNeubrutalism ? "#FFFFFF" : "#f8fafc" }}
                />

                {/* Top-Left Notch Cutout (Desktop only) */}
                <div
                  className={`hidden sm:block absolute -top-3 -left-3 w-6 h-6 rounded-full z-20 pointer-events-none ${
                    isNeubrutalism
                      ? "bg-white border-2 border-black"
                      : "bg-[#f8fafc] ring-1 ring-sky-400/30 shadow-inner"
                  }`}
                  style={{ backgroundColor: isNeubrutalism ? "#FFFFFF" : "#f8fafc" }}
                />

                {/* Bottom horizontal dashed tear line (Mobile only) */}
                <div
                  className="block sm:hidden absolute left-3 right-3 bottom-0 border-b-2 border-dashed z-20 pointer-events-none"
                  style={{
                    borderColor: isNeubrutalism ? "rgba(0, 0, 0, 0.35)" : "rgba(56, 189, 248, 0.5)",
                  }}
                />

                {/* Left vertical dashed tear line (Desktop only) */}
                <div
                  className="hidden sm:block absolute top-3 bottom-3 left-0 border-l-2 border-dashed z-20 pointer-events-none"
                  style={{
                    borderColor: isNeubrutalism ? "rgba(0, 0, 0, 0.35)" : "rgba(56, 189, 248, 0.5)",
                  }}
                />

                {/* QR Code Container */}
                <div
                  className={`p-3 sm:p-3 shrink-0 flex items-center justify-center ${
                    isNeubrutalism
                      ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                      : "bg-white rounded-2xl sm:rounded-3xl shadow-md border border-sky-100 ring-2 ring-sky-400/20"
                  }`}
                >
                  {qrMatrix.length > 0 && (
                    <div className="relative w-40 h-40 xs:w-44 xs:h-44 sm:w-40 sm:h-40 md:w-44 md:h-44 flex items-center justify-center">
                      <svg
                        viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                        className="w-full h-full shape-rendering-crispEdges"
                      >
                        <rect width="100%" height="100%" fill="#ffffff" />
                        {qrMatrix.map((row, r) =>
                          row.map((cell, c) =>
                            cell ? (
                              <rect
                                key={`${r}-${c}`}
                                x={c}
                                y={r}
                                width={1}
                                height={1}
                                fill="#000000"
                              />
                            ) : null
                          )
                        )}
                      </svg>
                      {/* Center Logo */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 p-0.5 flex items-center justify-center ${
                            isNeubrutalism
                              ? "bg-[#FFE600] border-2 border-black rounded-none shadow-[1px_1px_0_#000]"
                              : "bg-white rounded-md shadow-xs border border-slate-200"
                          }`}
                        >
                          <img
                            src="/YapprIcon.png"
                            alt="Logo"
                            className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stub bottom hint */}
                <p
                  className={`text-[10px] font-mono font-bold tracking-wider uppercase mt-3 sm:mt-2 ${
                    isNeubrutalism ? "text-black/70" : "text-sky-300/80"
                  }`}
                >
                  Scan to Yap
                </p>
              </motion.div>

              {/* PIECE 2: DETAILS PIECE (Bottom on Mobile, Left on Desktop) */}
              <motion.div
                animate={
                  isMobile
                    ? tearState === "tearing"
                      ? { y: 6, rotate: 0.8 }
                      : { y: 0, rotate: 0 }
                    : tearState === "tearing"
                    ? { x: -5, rotate: -0.8 }
                    : { x: 0, rotate: 0 }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`order-2 sm:order-1 relative flex-1 min-w-0 overflow-hidden flex flex-col justify-between p-5 sm:p-6 md:p-7 z-10 transition-all ${
                  isNeubrutalism
                    ? "bg-[#FFE600] border-2 sm:border-4 border-t-0 sm:border-t-4 sm:border-r-0 border-black shadow-[4px_4px_0_#000] sm:shadow-[6px_6px_0_#000] rounded-b-2xl sm:rounded-b-none sm:rounded-l-3xl text-black"
                    : "bg-gradient-to-b sm:bg-gradient-to-r from-[#121c2e] via-[#162237] to-[#1a273e] sm:from-[#0a101d] sm:via-[#0d1627] sm:to-[#121c2e] text-white border-2 border-t-0 sm:border-t-2 sm:border-r-0 border-sky-400/40 rounded-b-2xl sm:rounded-b-none sm:rounded-l-3xl shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
                }`}
              >
                {/* Top reflective highlight (Desktop only) */}
                {!isNeubrutalism && (
                  <div className="hidden sm:block absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-sky-400/50 pointer-events-none" />
                )}

                {/* Top-Right Notch Cutout (Active on both mobile and desktop) */}
                <div
                  className={`absolute -top-3 -right-3 w-6 h-6 rounded-full z-20 pointer-events-none ${
                    isNeubrutalism
                      ? "bg-white border-2 border-black"
                      : "bg-[#f8fafc] ring-1 ring-sky-400/30 shadow-inner"
                  }`}
                  style={{ backgroundColor: isNeubrutalism ? "#FFFFFF" : "#f8fafc" }}
                />

                {/* Top-Left Notch Cutout (Mobile only) */}
                <div
                  className={`block sm:hidden absolute -top-3 -left-3 w-6 h-6 rounded-full z-20 pointer-events-none ${
                    isNeubrutalism
                      ? "bg-white border-2 border-black"
                      : "bg-[#f8fafc] ring-1 ring-sky-400/30 shadow-inner"
                  }`}
                  style={{ backgroundColor: isNeubrutalism ? "#FFFFFF" : "#f8fafc" }}
                />

                {/* Bottom-Right Notch Cutout (Desktop only) */}
                <div
                  className={`hidden sm:block absolute -bottom-3 -right-3 w-6 h-6 rounded-full z-20 pointer-events-none ${
                    isNeubrutalism
                      ? "bg-white border-2 border-black"
                      : "bg-[#f8fafc] ring-1 ring-sky-400/30 shadow-inner"
                  }`}
                  style={{ backgroundColor: isNeubrutalism ? "#FFFFFF" : "#f8fafc" }}
                />

                {/* Top horizontal dashed tear line (Mobile only) */}
                <div
                  className="block sm:hidden absolute left-3 right-3 top-0 border-t-2 border-dashed z-20 pointer-events-none"
                  style={{
                    borderColor: isNeubrutalism ? "rgba(0, 0, 0, 0.35)" : "rgba(56, 189, 248, 0.5)",
                  }}
                />

                {/* Right vertical dashed tear line (Desktop only) */}
                <div
                  className="hidden sm:block absolute top-3 bottom-3 right-0 border-r-2 border-dashed z-20 pointer-events-none"
                  style={{
                    borderColor: isNeubrutalism ? "rgba(0, 0, 0, 0.35)" : "rgba(56, 189, 248, 0.5)",
                  }}
                />

                {/* Sender Profile Header */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <img
                    src={userProfilePic}
                    alt={userDisplayName}
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 object-cover shrink-0 ${
                      isNeubrutalism
                        ? "border-2 border-black rounded-none shadow-[2px_2px_0_#000]"
                        : "rounded-2xl ring-2 ring-sky-400 shadow-md"
                    }`}
                    onError={(e) => {
                      e.target.src = "/avatar.png";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-base sm:text-lg md:text-xl font-black truncate leading-tight ${
                        isNeubrutalism ? "text-black uppercase" : "text-white"
                      }`}
                    >
                      {userDisplayName}
                    </p>
                    <p
                      className={`text-xs sm:text-sm font-mono truncate mt-0.5 ${
                        isNeubrutalism ? "text-black/80 font-bold" : "text-sky-300 font-bold"
                      }`}
                    >
                      @{handleUsername}
                    </p>
                  </div>
                </div>

                {/* Friendly Invitation Text */}
                <p
                  className={`text-xs sm:text-sm font-semibold leading-relaxed my-2.5 sm:my-0 ${
                    isNeubrutalism ? "text-black" : "text-sky-100/90"
                  }`}
                >
                  {userDisplayName} has invited you to yap together!
                </p>

                {/* Download Button */}
                <div className="pt-2 sm:pt-1">
                  <motion.button
                    whileHover={{ scale: tearState === "idle" ? 1.02 : 1 }}
                    whileTap={{ scale: tearState === "idle" ? 0.97 : 1 }}
                    onClick={handleDownloadQR}
                    disabled={isDownloading || tearState !== "idle"}
                    className={`w-full sm:w-auto py-3 sm:py-2.5 px-5 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isNeubrutalism
                        ? "bg-black text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none hover:bg-[#FF007A]"
                        : "bg-white text-slate-900 rounded-xl shadow-md hover:bg-slate-100 font-black tracking-wide"
                    } ${tearState !== "idle" ? "opacity-80 pointer-events-none" : ""}`}
                  >
                    {tearState === "done" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Download
                        className={`w-4 h-4 ${
                          tearState !== "idle" ? "animate-bounce" : ""
                        }`}
                      />
                    )}
                    <span>
                      {tearState === "tearing"
                        ? "Tearing..."
                        : tearState === "flying"
                        ? "Sending to device..."
                        : tearState === "done"
                        ? "Downloaded!"
                        : "Download Pass"}
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Seam Anchor for Flying Particles */}
              <AnimatePresence>
                {(tearState === "tearing" || tearState === "flying") && (
                  <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={`flake-${i}`}
                        initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: isMobile
                            ? [(Math.random() - 0.5) * 60]
                            : [(Math.random() - 0.1) * 35],
                          y: isMobile
                            ? [(Math.random() - 0.5) * 40]
                            : [(i - 6) * 18 + (Math.random() - 0.5) * 20],
                          rotate: [(Math.random() - 0.5) * 90],
                          scale: [0.6, 1.2, 0.2],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.65, delay: i * 0.03, ease: "easeOut" }}
                        className="absolute w-1.5 h-1.5 rounded-xs"
                        style={{
                          top: isMobile ? `calc(50% + ${(i - 6) * 4}px)` : `${12 + (i * 76) / 12}%`,
                          left: isMobile ? `${15 + (i * 70) / 12}%` : "calc(100% - 190px)",
                          backgroundColor: isNeubrutalism ? "#000" : "#38bdf8",
                          boxShadow: isNeubrutalism ? "none" : "0 0 6px rgba(56, 189, 248, 0.8)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Ambient subtle glow beneath the landscape pass card */}
            {!isNeubrutalism && (
              <div className="absolute -bottom-2 left-6 right-6 h-6 bg-gradient-to-b from-sky-500/15 to-transparent rounded-full blur-xl pointer-events-none" />
            )}
          </div>

          {/* ═════ SHARE OPTIONS ═════ */}
          <div className="space-y-2.5 mx-auto w-full max-w-sm sm:max-w-none">
            <label
              className={`text-[11px] sm:text-xs font-black uppercase tracking-wider block ${
                isNeubrutalism ? "text-black" : "text-slate-500 font-bold"
              }`}
            >
              Share Options
            </label>

            {/* Mobile View: Collapsible Invite Link Input ABOVE the buttons */}
            <AnimatePresence>
              {isMobile && showLinkSection && (
                <motion.div
                  key="mobile-link-input"
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-2"
                >
                  <label
                    className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isNeubrutalism ? "text-black" : "text-slate-700 font-bold"
                    }`}
                  >
                    <Link2 className={`w-3.5 h-3.5 flex-shrink-0 ${isNeubrutalism ? "text-black" : "text-blue-600"}`} />
                    <span>Personal Invite Link</span>
                  </label>

                  <div
                    className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 ${
                      isNeubrutalism
                        ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                        : "bg-slate-100/90 border border-slate-200/90 rounded-2xl shadow-inner"
                    }`}
                  >
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className={`flex-1 bg-transparent px-3.5 py-2 text-xs sm:text-sm font-mono font-bold outline-none truncate w-full min-w-0 ${
                        isNeubrutalism ? "text-black" : "text-slate-800 font-semibold"
                      }`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCopyLink}
                      className={`w-full sm:w-auto px-4 py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all flex-shrink-0 cursor-pointer ${
                        isNeubrutalism
                          ? copied
                            ? "bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                            : "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                          : copied
                          ? "bg-emerald-600 text-white rounded-xl shadow-xs"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs font-bold"
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleLink}
                className={`w-full flex flex-row items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                  showLinkSection
                    ? isNeubrutalism
                      ? "bg-black text-white border-2 sm:border-3 border-black shadow-[2px_2px_0_#000] rounded-none"
                      : "rounded-xl sm:rounded-2xl bg-blue-600 text-white border border-blue-600 shadow-sm font-bold"
                    : isNeubrutalism
                    ? "bg-[#00E5FF] text-black border-2 sm:border-3 border-black shadow-[2px_2px_0_#000] rounded-none"
                    : "rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-50/90 via-blue-50/90 to-sky-100/70 text-sky-900 border border-sky-200/90 shadow-xs font-bold hover:shadow-sm"
                }`}
                title="View & Copy Personal Invite Link"
              >
                {copied ? (
                  <Check className={`w-4 h-4 shrink-0 ${showLinkSection ? "text-white" : "text-emerald-600"}`} />
                ) : (
                  <Link2 className={`w-4 h-4 shrink-0 ${showLinkSection ? "text-white" : "text-blue-600"}`} />
                )}
                <span className="tracking-wide text-xs">
                  {copied ? "Link Copied!" : "Share Invite Link"}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleShare("whatsapp")}
                className={`w-full flex flex-row items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? "bg-[#00E676] text-black border-2 sm:border-3 border-black shadow-[2px_2px_0_#000] rounded-none"
                    : "rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/90 to-emerald-100/70 text-emerald-900 border border-emerald-200/90 shadow-xs font-bold hover:shadow-sm"
                }`}
                title="Share via WhatsApp"
              >
                <MessageCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="tracking-wide text-xs">Share via WhatsApp</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleShare("gmail")}
                className={`w-full flex flex-row items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? "bg-[#FF007A] text-white border-2 sm:border-3 border-black shadow-[2px_2px_0_#000] rounded-none"
                    : "rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-50/90 via-pink-50/90 to-rose-100/70 text-rose-900 border border-rose-200/90 shadow-xs font-bold hover:shadow-sm"
                }`}
                title="Compose on Gmail"
              >
                <Mail className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="tracking-wide text-xs">Share via Gmail</span>
              </motion.button>
            </div>
          </div>

          {/* Desktop View: Collapsible Invite Link Input BELOW the buttons */}
          <AnimatePresence>
            {!isMobile && showLinkSection && (
              <motion.div
                key="desktop-link-input"
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2"
              >
                <label
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isNeubrutalism ? "text-black" : "text-slate-700 font-bold"
                  }`}
                >
                  <Link2 className={`w-3.5 h-3.5 flex-shrink-0 ${isNeubrutalism ? "text-black" : "text-blue-600"}`} />
                  <span>Personal Invite Link</span>
                </label>

                <div
                  className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 ${
                    isNeubrutalism
                      ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                      : "bg-slate-100/90 border border-slate-200/90 rounded-2xl shadow-inner"
                  }`}
                >
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className={`flex-1 bg-transparent px-3.5 py-2 text-xs sm:text-sm font-mono font-bold outline-none truncate w-full min-w-0 ${
                      isNeubrutalism ? "text-black" : "text-slate-800 font-semibold"
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCopyLink}
                    className={`w-full sm:w-auto px-4 py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all flex-shrink-0 cursor-pointer ${
                      isNeubrutalism
                        ? copied
                          ? "bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                          : "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                        : copied
                        ? "bg-emerald-600 text-white rounded-xl shadow-xs"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs font-bold"
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Footer */}
        <div
          className={`px-5 sm:px-6 py-3.5 text-center flex-shrink-0 ${
            isNeubrutalism
              ? "bg-[#FFFDF0] border-t-3 border-black text-black font-extrabold text-xs"
              : "bg-white/60 backdrop-blur-md border-t border-slate-200/70 text-slate-500 font-medium text-xs"
          }`}
        >
          <p className="leading-normal">
            Anyone with this link can create an account and connect with you on YAPPR.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default InvitePanel;
