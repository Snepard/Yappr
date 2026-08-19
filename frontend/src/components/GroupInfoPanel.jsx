import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  X,
  Users,
  Shield,
  ShieldAlert,
  Clock,
  UserX,
  Edit,
  Sliders,
  LogOut,
  MoreVertical,
  Check,
  UserPlus,
  Crown,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Tooltip from "./Tooltip";

const GroupInfoPanel = ({ onClose }) => {
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const {
    selectedGroup,
    updateGroupInfo,
    updateGroupPermissions,
    addMembers,
    removeMember,
    toggleAdminRole,
    timeoutMember,
    removeTimeout,
    leaveGroup,
    setIsGroupInfoOpen,
  } = useGroupStore();

  const [activeTab, setActiveTab] = useState("members"); // "members" | "permissions" | "edit"
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedNewMemberIds, setSelectedNewMemberIds] = useState([]);

  // Timeout dialog state
  const [timeoutTargetUser, setTimeoutTargetUser] = useState(null);
  const [timeoutMinutes, setTimeoutMinutes] = useState(5);

  // Edit info state
  const [editName, setEditName] = useState(selectedGroup?.name || "");
  const [editDesc, setEditDesc] = useState(selectedGroup?.description || "");
  const [editPic, setEditPic] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Action menu dropdown state per user ID
  const [openUserMenuId, setOpenUserMenuId] = useState(null);

  // Close action menu dropdown when clicking anywhere else on screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openUserMenuId && !event.target.closest('[data-user-menu="true"]')) {
        setOpenUserMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openUserMenuId]);

  const handleClose = () => {
    if (onClose) onClose();
    else setIsGroupInfoOpen(false);
  };

  if (!selectedGroup) return null;

  const myId = authUser?._id;
  const isCreator = (selectedGroup.createdBy?._id || selectedGroup.createdBy)?.toString() === myId?.toString();
  const isAdmin = isCreator || selectedGroup.admins?.some(
    (a) => (a._id || a).toString() === myId?.toString()
  );

  const canEditInfo = isAdmin || selectedGroup.permissions?.allowMembersToEditGroupInfo;
  const canAddMembers = isAdmin || selectedGroup.permissions?.allowMembersToAddOthers;

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setEditPic(reader.result);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }
    setIsUpdating(true);
    await updateGroupInfo(selectedGroup._id, {
      name: editName.trim(),
      description: editDesc.trim(),
      groupPic: editPic || selectedGroup.groupPic,
    });
    setIsUpdating(false);
  };

  const handlePermissionToggle = (key, val) => {
    if (!isAdmin) return;
    const updated = {
      ...selectedGroup.permissions,
      [key]: val,
    };
    updateGroupPermissions(selectedGroup._id, updated);
  };

  const handleAddMembersSubmit = async () => {
    if (selectedNewMemberIds.length === 0) return;
    await addMembers(selectedGroup._id, selectedNewMemberIds);
    setSelectedNewMemberIds([]);
    setShowAddMember(false);
  };

  const handleApplyTimeout = async () => {
    if (!timeoutTargetUser || !timeoutMinutes || timeoutMinutes <= 0) return;
    const targetUserIdStr = (timeoutTargetUser._id || timeoutTargetUser).toString();
    await timeoutMember(selectedGroup._id, targetUserIdStr, timeoutMinutes);
    setTimeoutTargetUser(null);
  };

  // Filter available friends not yet in group
  const existingMemberIds = (selectedGroup.members || []).map((m) => (m._id || m).toString());
  const safeUsers = Array.isArray(users) ? users : [];
  const availableFriends = safeUsers.filter((u) => !existingMemberIds.includes(u._id.toString()));

  return (
    <div
      className={`flex-1 flex items-center justify-center p-4 sm:p-6 transition-all overflow-hidden h-full ${
        isNeubrutalism
          ? "bg-[#FFFDF0] text-black"
          : "bg-gradient-to-br from-slate-50/70 via-blue-50/40 to-sky-50/60 backdrop-blur-xl"
      }`}
    >
      {/* Standardized Outer Frame Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={`relative w-full max-w-2xl h-[580px] sm:h-[620px] max-h-[88vh] overflow-hidden flex flex-col transition-all ${
          isNeubrutalism
            ? "bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none text-black"
            : "bg-white/80 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl shadow-[0_20px_60px_rgba(14,165,233,0.15)] border border-white/90 ring-1 ring-sky-500/15"
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-5 sm:p-6 text-center relative flex-shrink-0 ${
            isNeubrutalism
              ? "bg-[#FFE600] border-b-3 border-black text-black"
              : "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-xs"
          }`}
        >
          <button
            onClick={handleClose}
            className={`absolute top-3.5 left-3.5 sm:top-4 sm:left-4 p-1.5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold px-3 ${
              isNeubrutalism
                ? "bg-white border-2 border-black text-black shadow-[2px_2px_0_#000] rounded-none font-bold"
                : "rounded-full bg-white/20 hover:bg-white/30 text-white hover:scale-105 active:scale-95"
            }`}
            title="Back to Chat"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chat</span>
          </button>

          <button
            onClick={handleClose}
            className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 transition-colors cursor-pointer ${
              isNeubrutalism
                ? "bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold"
                : "rounded-full bg-white/20 hover:bg-white/30 text-white hover:scale-105 active:scale-95"
            }`}
            title="Close"
          >
            <X className={`w-4 h-4 sm:w-5 sm:h-5 ${isNeubrutalism ? "stroke-[3]" : ""}`} />
          </button>

          <div className="flex flex-col items-center mt-1 sm:mt-2">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 overflow-hidden flex items-center justify-center mb-2 sm:mb-3 ${
                isNeubrutalism
                  ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                  : "rounded-2xl ring-4 ring-white/30 shadow-md bg-white/10"
              }`}
            >
              {selectedGroup.groupPic ? (
                <img
                  src={selectedGroup.groupPic}
                  alt={selectedGroup.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className={`w-8 h-8 sm:w-10 sm:h-10 ${isNeubrutalism ? "text-black" : "text-white"}`} />
              )}
            </div>
            <h2
              className={
                isNeubrutalism
                  ? "text-lg sm:text-xl font-black text-black uppercase truncate max-w-xs sm:max-w-sm"
                  : "text-lg sm:text-xl font-extrabold truncate max-w-xs sm:max-w-sm"
              }
            >
              {selectedGroup.name}
            </h2>
            {selectedGroup.description && (
              <p className="text-xs text-blue-100/90 max-w-sm line-clamp-1 mt-0.5">
                {selectedGroup.description}
              </p>
            )}
            <div
              className={`flex items-center space-x-2 mt-2 text-[11px] ${
                isNeubrutalism
                  ? "text-black bg-white px-3 py-0.5 border border-black shadow-[1px_1px_0_#000] font-black rounded-none"
                  : "text-blue-100 bg-white/15 px-3 py-0.5 rounded-full backdrop-blur-md font-semibold"
              }`}
            >
              <Crown className={`w-3.5 h-3.5 ${isNeubrutalism ? "text-black" : "text-amber-300"}`} />
              <span>Created by {selectedGroup.createdBy?.fullName || "Admin"}</span>
              <span>•</span>
              <span>{selectedGroup.members?.length || 0} Members</span>
            </div>
          </div>
        </div>

        {/* Segmented Tab Navigation */}
        <div
          className={
            isNeubrutalism
              ? "flex border-b-3 border-black bg-white px-2 pt-2 gap-1 font-black"
              : "flex border-b border-sky-100/80 bg-slate-100/60 p-1.5 gap-1.5"
          }
        >
          <button
            onClick={() => setActiveTab("members")}
            className={
              isNeubrutalism
                ? `flex-1 py-2 text-xs font-black uppercase flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    activeTab === "members"
                      ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                      : "text-black hover:bg-yellow-100 rounded-none font-bold"
                  }`
                : `relative flex-1 py-2 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer rounded-xl ${
                    activeTab === "members"
                      ? "text-blue-700 font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`
            }
          >
            {!isNeubrutalism && activeTab === "members" && (
              <motion.div
                layoutId="groupInfoTabIndicator"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-blue-200/60 z-0"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Users className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : ""}`} />
              <span>Members ({selectedGroup.members?.length})</span>
            </span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("permissions")}
              className={
                isNeubrutalism
                  ? `flex-1 py-2 text-xs font-black uppercase flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      activeTab === "permissions"
                        ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                        : "text-black hover:bg-yellow-100 rounded-none font-bold"
                    }`
                  : `relative flex-1 py-2 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer rounded-xl ${
                      activeTab === "permissions"
                        ? "text-blue-700 font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    }`
              }
            >
              {!isNeubrutalism && activeTab === "permissions" && (
                <motion.div
                  layoutId="groupInfoTabIndicator"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-blue-200/60 z-0"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Sliders className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : ""}`} />
                <span>Permissions</span>
              </span>
            </button>
          )}

          {canEditInfo && (
            <button
              onClick={() => {
                setActiveTab("edit");
                setEditName(selectedGroup.name);
                setEditDesc(selectedGroup.description || "");
              }}
              className={
                isNeubrutalism
                  ? `flex-1 py-2 text-xs font-black uppercase flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      activeTab === "edit"
                        ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                        : "text-black hover:bg-yellow-100 rounded-none font-bold"
                    }`
                  : `relative flex-1 py-2 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer rounded-xl ${
                      activeTab === "edit"
                        ? "text-blue-700 font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    }`
              }
            >
              {!isNeubrutalism && activeTab === "edit" && (
                <motion.div
                  layoutId="groupInfoTabIndicator"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-blue-200/60 z-0"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Edit className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : ""}`} />
                <span>Edit Info</span>
              </span>
            </button>
          )}
        </div>

        {/* Panel Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 min-h-0">
          {/* TAB 1: MEMBERS */}
          {activeTab === "members" && (
            <div className="space-y-3">
              {/* Add Member Button if Authorized */}
              {canAddMembers && (
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowAddMember(!showAddMember)}
                    className={
                      isNeubrutalism
                        ? "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black text-black bg-[#00E5FF] border-2 border-black shadow-[2px_2px_0_#000] rounded-none uppercase transition-all cursor-pointer"
                        : "flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    }
                  >
                    <UserPlus className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : ""}`} />
                    <span>Add Members</span>
                  </motion.button>
                </div>
              )}

              {/* Add Members Panel */}
              <AnimatePresence>
                {showAddMember && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={
                      isNeubrutalism
                        ? "p-3 bg-[#FFFDF0] border-2 border-black shadow-[3px_3px_0_#000] rounded-none space-y-2 text-black"
                        : "p-3 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-2"
                    }
                  >
                    <p className={isNeubrutalism ? "text-xs font-black text-black uppercase" : "text-xs font-bold text-gray-700"}>Select friends to add:</p>
                    {availableFriends.length === 0 ? (
                      <p className={isNeubrutalism ? "text-xs text-black/70 font-bold" : "text-xs text-gray-400"}>All your friends are already in this group!</p>
                    ) : (
                      <div className={isNeubrutalism ? "max-h-36 overflow-y-auto space-y-1 border-2 border-black bg-white p-1 rounded-none" : "max-h-36 overflow-y-auto space-y-1"}>
                        {availableFriends.map((friend) => {
                          const isSelected = selectedNewMemberIds.includes(friend._id);
                          return (
                            <div
                              key={friend._id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedNewMemberIds(selectedNewMemberIds.filter((id) => id !== friend._id));
                                } else {
                                  setSelectedNewMemberIds([...selectedNewMemberIds, friend._id]);
                                }
                              }}
                              className={
                                isNeubrutalism
                                  ? `flex items-center justify-between p-2 cursor-pointer text-xs ${
                                      isSelected ? "bg-[#FFE600] text-black font-black border border-black" : "bg-white hover:bg-yellow-50 font-bold text-black"
                                    }`
                                  : `flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                                      isSelected ? "bg-blue-100 text-blue-900 font-bold" : "bg-white hover:bg-gray-100 text-gray-800"
                                    }`
                              }
                            >
                              <span>{friend.fullName} (@{friend.username})</span>
                              {isSelected && <Check className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[3]" : "text-blue-600"}`} />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {availableFriends.length > 0 && (
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setShowAddMember(false)}
                          className={
                            isNeubrutalism
                              ? "px-3 py-1 text-xs text-black bg-white border-2 border-black font-black uppercase rounded-none cursor-pointer"
                              : "px-3 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded-xl cursor-pointer font-semibold"
                          }
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddMembersSubmit}
                          disabled={selectedNewMemberIds.length === 0}
                          className={
                            isNeubrutalism
                              ? "px-3 py-1 text-xs font-black uppercase text-black bg-[#00E676] border-2 border-black shadow-[2px_2px_0_#000] rounded-none disabled:opacity-50 cursor-pointer"
                              : "px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 cursor-pointer shadow-2xs"
                          }
                        >
                          Add Selected ({selectedNewMemberIds.length})
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Members List Container */}
              <div
                className={
                  isNeubrutalism
                    ? "border-2 border-black bg-white shadow-[3px_3px_0_#000] rounded-none divide-y-2 divide-black overflow-hidden"
                    : "divide-y divide-gray-100 border border-sky-100 bg-white/70 rounded-2xl shadow-xs overflow-hidden"
                }
              >
                {selectedGroup.members?.map((member) => {
                  const memberIdStr = (member._id || member).toString();
                  const isMemberCreator = (selectedGroup.createdBy?._id || selectedGroup.createdBy)?.toString() === memberIdStr;
                  const isMemberAdmin = selectedGroup.admins?.some(
                    (a) => (a._id || a).toString() === memberIdStr
                  );

                  const now = new Date();
                  const activeTimeoutObj = (selectedGroup.timeouts || []).find(
                    (t) => (t.userId?._id || t.userId)?.toString() === memberIdStr && new Date(t.until) > now
                  );
                  const isMemberTimedOut = Boolean(activeTimeoutObj);
                  const isExpanded = openUserMenuId === memberIdStr;

                  return (
                    <div
                      key={memberIdStr}
                      data-user-menu="true"
                      className={`p-3.5 flex flex-col transition-all duration-200 ${
                        isNeubrutalism
                          ? isExpanded ? "bg-[#FFFDF0] border-l-4 border-l-black" : "hover:bg-yellow-50"
                          : isExpanded ? "bg-blue-50/70 border-l-4 border-l-blue-600" : "hover:bg-sky-50/40"
                      }`}
                    >
                      {/* Top Row: User Summary */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={member.profilePic || "/avatar.png"}
                            alt={member.fullName}
                            className={`w-9 h-9 object-cover shrink-0 ${
                              isNeubrutalism
                                ? "rounded-none border border-black shadow-[1px_1px_0_#000]"
                                : "rounded-full border border-white shadow-xs"
                            }`}
                            onError={(e) => {
                              e.target.src = "/avatar.png";
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <span className={`text-xs truncate ${isNeubrutalism ? "font-black text-black" : "font-bold text-gray-800"}`}>
                                {member.fullName} {memberIdStr === myId && "(You)"}
                              </span>
                              {isMemberCreator && (
                                <span className={
                                  isNeubrutalism
                                    ? "bg-[#FFE600] text-black border border-black text-[10px] font-black uppercase px-2 py-0.5 rounded-none flex items-center gap-1 shadow-[1px_1px_0_#000]"
                                    : "bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"
                                }>
                                  <Crown className="w-3 h-3 text-amber-600" /> Creator
                                </span>
                              )}
                              {!isMemberCreator && isMemberAdmin && (
                                <span className={
                                  isNeubrutalism
                                    ? "bg-[#00E5FF] text-black border border-black text-[10px] font-black uppercase px-2 py-0.5 rounded-none flex items-center gap-1 shadow-[1px_1px_0_#000]"
                                    : "bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"
                                }>
                                  <Shield className="w-3 h-3 text-blue-600" /> Admin
                                </span>
                              )}
                              {isMemberTimedOut && (
                                <span className={
                                  isNeubrutalism
                                    ? "bg-[#FF007A] text-white border border-black text-[10px] font-black uppercase px-2 py-0.5 rounded-none flex items-center gap-1 shadow-[1px_1px_0_#000]"
                                    : "bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"
                                }>
                                  <Clock className="w-3 h-3 text-white animate-pulse" /> Timed Out
                                </span>
                              )}
                            </div>
                            <span className={isNeubrutalism ? "text-[10px] font-bold text-black opacity-70" : "text-[10px] text-gray-400 font-medium"}>@{member.username}</span>
                          </div>
                        </div>

                        {/* Admin Options Toggle Button */}
                        {isAdmin && memberIdStr !== myId && (
                          <Tooltip label="Manage" position="left">
                            <button
                              onClick={() =>
                                setOpenUserMenuId(isExpanded ? null : memberIdStr)
                              }
                              title="Manage"
                              className={
                                isNeubrutalism
                                  ? `p-1.5 transition-all cursor-pointer ${
                                      isExpanded
                                        ? "bg-black text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                                        : "bg-white text-black border-2 border-black hover:bg-[#FFE600] shadow-[2px_2px_0_#000] rounded-none"
                                    }`
                                  : `p-1.5 rounded-xl transition-all cursor-pointer ${
                                      isExpanded
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "hover:bg-sky-100 text-gray-500"
                                    }`
                              }
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                      </div>

                      {/* Inline Action Strip */}
                      <AnimatePresence>
                        {isAdmin && memberIdStr !== myId && isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={
                              isNeubrutalism
                                ? "mt-2.5 pt-2.5 border-t-2 border-black flex items-center gap-2 flex-wrap"
                                : "mt-2.5 pt-2.5 border-t border-blue-200/50 flex items-center gap-2 flex-wrap"
                            }
                          >
                            {!isMemberCreator && (
                              <button
                                onClick={() => {
                                  toggleAdminRole(selectedGroup._id, memberIdStr, !isMemberAdmin);
                                  setOpenUserMenuId(null);
                                }}
                                className={
                                  isNeubrutalism
                                    ? "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black uppercase text-black bg-[#00E5FF] border-2 border-black shadow-[2px_2px_0_#000] rounded-none cursor-pointer"
                                    : "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                }
                              >
                                <Shield className="w-3.5 h-3.5 text-black" />
                                <span>{isMemberAdmin ? "Demote Admin" : "Make Admin"}</span>
                              </button>
                            )}

                            {!isMemberCreator && (
                              <>
                                {isMemberTimedOut ? (
                                  <button
                                    onClick={() => {
                                      removeTimeout(selectedGroup._id, memberIdStr);
                                      setOpenUserMenuId(null);
                                    }}
                                    className={
                                      isNeubrutalism
                                        ? "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black uppercase text-black bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] rounded-none cursor-pointer"
                                        : "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                    }
                                  >
                                    <Clock className="w-3.5 h-3.5 text-black" />
                                    <span>Remove Timeout</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setTimeoutTargetUser(member);
                                      setOpenUserMenuId(null);
                                    }}
                                    className={
                                      isNeubrutalism
                                        ? "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black uppercase text-black bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] rounded-none cursor-pointer"
                                        : "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                    }
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5 text-black" />
                                    <span>Give Timeout</span>
                                  </button>
                                )}
                              </>
                            )}

                            {!isMemberCreator && (
                              <button
                                onClick={() => {
                                  removeMember(selectedGroup._id, memberIdStr);
                                  setOpenUserMenuId(null);
                                }}
                                className={
                                  isNeubrutalism
                                    ? "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black uppercase text-white bg-[#FF007A] border-2 border-black shadow-[2px_2px_0_#000] rounded-none cursor-pointer"
                                    : "flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-100 border border-red-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                }
                              >
                                <UserX className="w-3.5 h-3.5 text-white" />
                                <span>Remove</span>
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PERMISSIONS (ADMIN ONLY) */}
          {activeTab === "permissions" && isAdmin && (
            <div className="space-y-4">
              <div
                className={
                  isNeubrutalism
                    ? "p-4 bg-[#00E5FF] border-2 border-black shadow-[3px_3px_0_#000] rounded-none space-y-2 text-black"
                    : "p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1.5"
                }
              >
                <h3 className={isNeubrutalism ? "text-xs font-black uppercase text-black flex items-center space-x-1.5" : "text-xs font-bold text-blue-900 flex items-center space-x-1.5"}>
                  <Shield className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-blue-600"}`} />
                  <span>Member Authorities & Governance</span>
                </h3>
                <p className={isNeubrutalism ? "text-[11px] font-extrabold text-black/90 leading-relaxed" : "text-[11px] text-blue-700/90 leading-relaxed font-medium"}>
                  As a Group Admin, you control what actions normal members are authorized to perform inside this group.
                </p>
              </div>

              <div className="space-y-3">
                {/* Permission 1: Edit Info */}
                <div
                  className={
                    isNeubrutalism
                      ? "flex items-center justify-between p-3.5 bg-white border-2 border-black shadow-[3px_3px_0_#000] rounded-none text-black font-bold"
                      : "flex items-center justify-between p-3.5 bg-white/70 border border-sky-100 rounded-2xl shadow-xs"
                  }
                >
                  <div>
                    <p className={isNeubrutalism ? "text-xs font-black uppercase text-black" : "text-xs font-bold text-gray-800"}>Edit Group Name & Profile Pic</p>
                    <p className={isNeubrutalism ? "text-[11px] font-extrabold text-black/70" : "text-[11px] text-gray-500 font-medium"}>Allow normal members to edit group info and photo</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedGroup.permissions?.allowMembersToEditGroupInfo)}
                    onChange={(e) =>
                      handlePermissionToggle("allowMembersToEditGroupInfo", e.target.checked)
                    }
                    className={isNeubrutalism ? "accent-black h-4 w-4 rounded-none cursor-pointer" : "w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500 cursor-pointer"}
                  />
                </div>

                {/* Permission 2: Send Messages */}
                <div
                  className={
                    isNeubrutalism
                      ? "flex items-center justify-between p-3.5 bg-white border-2 border-black shadow-[3px_3px_0_#000] rounded-none text-black font-bold"
                      : "flex items-center justify-between p-3.5 bg-white/70 border border-sky-100 rounded-2xl shadow-xs"
                  }
                >
                  <div>
                    <p className={isNeubrutalism ? "text-xs font-black uppercase text-black" : "text-xs font-bold text-gray-800"}>Send Messages in Group</p>
                    <p className={isNeubrutalism ? "text-[11px] font-extrabold text-black/70" : "text-[11px] text-gray-500 font-medium"}>If disabled, only Admins can send messages (Announcement mode)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedGroup.permissions?.allowMembersToSendMessages)}
                    onChange={(e) =>
                      handlePermissionToggle("allowMembersToSendMessages", e.target.checked)
                    }
                    className={isNeubrutalism ? "accent-black h-4 w-4 rounded-none cursor-pointer" : "w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500 cursor-pointer"}
                  />
                </div>

                {/* Permission 3: Add Members */}
                <div
                  className={
                    isNeubrutalism
                      ? "flex items-center justify-between p-3.5 bg-white border-2 border-black shadow-[3px_3px_0_#000] rounded-none text-black font-bold"
                      : "flex items-center justify-between p-3.5 bg-white/70 border border-sky-100 rounded-2xl shadow-xs"
                  }
                >
                  <div>
                    <p className={isNeubrutalism ? "text-xs font-black uppercase text-black" : "text-xs font-bold text-gray-800"}>Add New Members</p>
                    <p className={isNeubrutalism ? "text-[11px] font-extrabold text-black/70" : "text-[11px] text-gray-500 font-medium"}>Allow normal members to invite/add new friends</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedGroup.permissions?.allowMembersToAddOthers)}
                    onChange={(e) =>
                      handlePermissionToggle("allowMembersToAddOthers", e.target.checked)
                    }
                    className={isNeubrutalism ? "accent-black h-4 w-4 rounded-none cursor-pointer" : "w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500 cursor-pointer"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDIT INFO */}
          {activeTab === "edit" && canEditInfo && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              {/* Group Pic Input */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative group cursor-pointer">
                  <div
                    className={
                      isNeubrutalism
                        ? "w-20 h-20 overflow-hidden bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none flex items-center justify-center"
                        : "w-20 h-20 rounded-2xl overflow-hidden bg-sky-50 border-2 border-dashed border-blue-300 flex items-center justify-center shadow-xs"
                    }
                  >
                    {editPic || selectedGroup.groupPic ? (
                      <img
                        src={editPic || selectedGroup.groupPic}
                        alt="Group Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className={`w-8 h-8 ${isNeubrutalism ? "text-black" : "text-blue-400"}`} />
                    )}
                  </div>
                  <label
                    htmlFor="edit-group-pic-panel"
                    className={
                      isNeubrutalism
                        ? "absolute inset-0 bg-black/60 rounded-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        : "absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    }
                  >
                    <ImageIcon className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="edit-group-pic-panel"
                    type="file"
                    accept="image/*"
                    onChange={handlePicUpload}
                    className="hidden"
                  />
                </div>
                <p className={isNeubrutalism ? "text-[11px] text-black font-extrabold mt-1.5 uppercase" : "text-[11px] text-gray-400 mt-1.5 font-medium"}>Click to update group picture</p>
              </div>

              <div>
                <label className={isNeubrutalism ? "block text-xs font-black uppercase text-black mb-1" : "block text-xs font-bold text-gray-700 mb-1"}>Group Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={
                    isNeubrutalism
                      ? "w-full px-3.5 py-2.5 text-xs bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold focus:bg-[#FFE600] outline-none"
                      : "w-full px-3.5 py-2.5 text-xs bg-white/80 border border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  }
                  required
                />
              </div>

              <div>
                <label className={isNeubrutalism ? "block text-xs font-black uppercase text-black mb-1" : "block text-xs font-bold text-gray-700 mb-1"}>Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className={
                    isNeubrutalism
                      ? "w-full px-3.5 py-2.5 text-xs bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold focus:bg-[#FFE600] outline-none resize-none"
                      : "w-full px-3.5 py-2.5 text-xs bg-white/80 border border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  }
                />
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isUpdating}
                  className={
                    isNeubrutalism
                      ? "px-5 py-2.5 text-xs font-black uppercase text-black bg-[#00E676] border-3 border-black shadow-[3px_3px_0_#000] rounded-none disabled:opacity-50 cursor-pointer"
                      : "px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                  }
                >
                  {isUpdating ? "Saving..." : "Save Group Info"}
                </motion.button>
              </div>
            </form>
          )}

          {/* Leave Group Action */}
          <div
            className={
              isNeubrutalism
                ? "pt-4 border-t-3 border-black flex items-center justify-between"
                : "pt-4 border-t border-sky-100 flex items-center justify-between"
            }
          >
            <span className={isNeubrutalism ? "text-[11px] font-extrabold text-black" : "text-[11px] text-gray-400 font-medium"}>Group ID: {selectedGroup._id}</span>
            <button
              onClick={() => leaveGroup(selectedGroup._id)}
              className={
                isNeubrutalism
                  ? "flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-black uppercase text-white bg-[#FF007A] border-2 border-black shadow-[2px_2px_0_#000] rounded-none cursor-pointer"
                  : "flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
              }
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Group</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* TIMEOUT DIALOG POPUP */}
      {timeoutTargetUser && (
        <div
          onClick={() => setTimeoutTargetUser(null)}
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className={
              isNeubrutalism
                ? "bg-white w-full max-w-sm border-4 border-black shadow-[8px_8px_0_#000] rounded-none p-5 text-black font-bold space-y-4"
                : "bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-amber-200 space-y-4"
            }
          >
            <div className="flex items-center space-x-2 text-black">
              <ShieldAlert className={`w-5 h-5 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-amber-600"}`} />
              <h3 className={isNeubrutalism ? "text-sm font-black uppercase" : "text-sm font-bold"}>Timeout Member</h3>
            </div>

            <p className="text-xs text-black/80 font-bold">
              Select timeout duration for <strong className="text-black font-black underline">{timeoutTargetUser.fullName}</strong>. They will enter read-only mode with a live countdown timer.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Duration (Minutes):</label>
              <select
                value={timeoutMinutes}
                onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                className={
                  isNeubrutalism
                    ? "w-full p-2 text-xs bg-white text-black border-2 border-black font-bold rounded-none"
                    : "w-full p-2 text-xs border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500/30 outline-none"
                }
              >
                <option value={1}>1 Minute</option>
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={1440}>24 Hours</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setTimeoutTargetUser(null)}
                className={
                  isNeubrutalism
                    ? "px-3 py-1.5 text-xs text-black bg-white border-2 border-black font-black uppercase rounded-none cursor-pointer"
                    : "px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer"
                }
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTimeout}
                className={
                  isNeubrutalism
                    ? "px-4 py-1.5 text-xs font-black uppercase text-black bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] rounded-none cursor-pointer"
                    : "px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                }
              >
                Apply Timeout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoPanel;
