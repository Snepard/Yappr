import { useState, useEffect, useRef } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import {
  X,
  Users,
  Shield,
  ShieldAlert,
  Clock,
  UserX,
  UserCheck,
  Edit,
  Sliders,
  LogOut,
  MoreVertical,
  Check,
  UserPlus,
  Crown,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "./Tooltip";

const GroupInfoModal = ({ isOpen, onClose }) => {
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
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

  if (!isOpen || !selectedGroup) return null;

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
  const availableFriends = users.filter((u) => !existingMemberIds.includes(u._id.toString()));

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-md mb-3 bg-white/10 flex items-center justify-center">
              {selectedGroup.groupPic ? (
                <img
                  src={selectedGroup.groupPic}
                  alt={selectedGroup.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold truncate max-w-xs">{selectedGroup.name}</h2>
            {selectedGroup.description && (
              <p className="text-xs text-blue-100/90 max-w-sm line-clamp-2 mt-1">
                {selectedGroup.description}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-3 text-[11px] font-semibold text-blue-100 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Created by {selectedGroup.createdBy?.fullName || "Admin"}</span>
              <span>•</span>
              <span>{selectedGroup.members?.length || 0} Members</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 px-4">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "members"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members ({selectedGroup.members?.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("permissions")}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "permissions"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Permissions</span>
            </button>
          )}

          {canEditInfo && (
            <button
              onClick={() => {
                setActiveTab("edit");
                setEditName(selectedGroup.name);
                setEditDesc(selectedGroup.description || "");
              }}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "edit"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Edit Info</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: MEMBERS */}
          {activeTab === "members" && (
            <div className="space-y-3">
              {/* Add Member Button if Authorized */}
              {canAddMembers && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Members</span>
                  </button>
                </div>
              )}

              {/* Add Members Panel */}
              {showAddMember && (
                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <p className="text-xs font-bold text-gray-700">Select friends to add:</p>
                  {availableFriends.length === 0 ? (
                    <p className="text-xs text-gray-400">All your friends are already in this group!</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5">
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
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                              isSelected ? "bg-blue-100 text-blue-900 font-semibold" : "bg-white hover:bg-gray-100"
                            }`}
                          >
                            <span>{friend.fullName} (@{friend.username})</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {availableFriends.length > 0 && (
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setShowAddMember(false)}
                        className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMembersSubmit}
                        disabled={selectedNewMemberIds.length === 0}
                        className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Add Selected ({selectedNewMemberIds.length})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl shadow-xs overflow-hidden">
                {selectedGroup.members?.map((member) => {
                  const memberIdStr = (member._id || member).toString();
                  const isMemberCreator = (selectedGroup.createdBy?._id || selectedGroup.createdBy)?.toString() === memberIdStr;
                  const isMemberAdmin = selectedGroup.admins?.some(
                    (a) => (a._id || a).toString() === memberIdStr
                  );

                  // Check active timeout for member
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
                      className={`p-3 flex flex-col transition-all duration-200 ${
                        isExpanded
                          ? "bg-blue-50/70 border-l-4 border-l-blue-600"
                          : "hover:bg-gray-50/80"
                      }`}
                    >
                      {/* Member Summary Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={member.profilePic || "/avatar.png"}
                            alt={member.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-white shadow-xs shrink-0"
                            onError={(e) => {
                              e.target.src = "/avatar.png";
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <span className="text-xs font-bold text-gray-800 truncate">
                                {member.fullName} {memberIdStr === myId && "(You)"}
                              </span>
                              {isMemberCreator && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-amber-600" /> Creator
                                </span>
                              )}
                              {!isMemberCreator && isMemberAdmin && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-blue-600" /> Admin
                                </span>
                              )}
                              {isMemberTimedOut && (
                                <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-red-600 animate-pulse" /> Timed Out
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">@{member.username}</span>
                          </div>
                        </div>

                        {/* Admin Action Button */}
                        {isAdmin && memberIdStr !== myId && (
                          <Tooltip label="Manage" position="left">
                            <button
                              onClick={() =>
                                setOpenUserMenuId(isExpanded ? null : memberIdStr)
                              }
                              title="Manage"
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                isExpanded
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "hover:bg-gray-200 text-gray-500"
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                      </div>

                      {/* Smooth Inline Action Strip */}
                      {isAdmin && memberIdStr !== myId && isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-blue-200/50 flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-200">
                          {!isMemberCreator && (
                            <button
                              onClick={() => {
                                toggleAdminRole(selectedGroup._id, memberIdStr, !isMemberAdmin);
                                setOpenUserMenuId(null);
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Shield className="w-3.5 h-3.5 text-blue-600" />
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
                                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Remove Timeout</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setTimeoutTargetUser(member);
                                    setOpenUserMenuId(null);
                                  }}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
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
                              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-100 border border-red-200/70 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              <UserX className="w-3.5 h-3.5 text-red-600" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PERMISSIONS (ADMIN ONLY) */}
          {activeTab === "permissions" && isAdmin && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Member Authorities & Governance</span>
                </h3>
                <p className="text-[11px] text-blue-700/90 leading-relaxed">
                  As a Group Admin, you control what actions normal members are authorized to perform inside this group.
                </p>
              </div>

              <div className="space-y-3">
                {/* Permission 1: Edit Info */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Edit Group Name & Profile Pic</p>
                    <p className="text-[11px] text-gray-500">Allow normal members to edit group info and photo</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedGroup.permissions?.allowMembersToEditGroupInfo)}
                    onChange={(e) =>
                      handlePermissionToggle("allowMembersToEditGroupInfo", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Permission 2: Send Messages */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Send Messages in Group</p>
                    <p className="text-[11px] text-gray-500">If disabled, only Admins can send messages (Group Announcement mode)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedGroup.permissions?.allowMembersToSendMessages)}
                    onChange={(e) =>
                      handlePermissionToggle("allowMembersToSendMessages", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Permission 3: Add Members */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Add New Members</p>
                    <p className="text-[11px] text-gray-500">Allow normal members to invite/add new friends</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedGroup.permissions?.allowMembersToAddOthers)}
                    onChange={(e) =>
                      handlePermissionToggle("allowMembersToAddOthers", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500 cursor-pointer"
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
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-sky-50 border-2 border-dashed border-blue-300 flex items-center justify-center shadow-xs">
                    {editPic || selectedGroup.groupPic ? (
                      <img
                        src={editPic || selectedGroup.groupPic}
                        alt="Group Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-blue-400" />
                    )}
                  </div>
                  <label
                    htmlFor="edit-group-pic"
                    className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <ImageIcon className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="edit-group-pic"
                    type="file"
                    accept="image/*"
                    onChange={handlePicUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Click to update group picture</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isUpdating ? "Saving..." : "Save Group Info"}
                </button>
              </div>
            </form>
          )}

          {/* Leave Group Action */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Group ID: {selectedGroup._id}</span>
            <button
              onClick={() => leaveGroup(selectedGroup._id)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* TIMEOUT DIALOG POPUP */}
      {timeoutTargetUser && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-amber-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-amber-800">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold">Timeout Member</h3>
            </div>

            <p className="text-xs text-gray-600">
              Select timeout duration for <strong className="text-gray-900">{timeoutTargetUser.fullName}</strong>. They will enter read-only mode with a live countdown timer.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 15, 60, 1440].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTimeoutMinutes(mins)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    timeoutMinutes === mins
                      ? "bg-amber-500 text-white border-amber-500 shadow-md"
                      : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {mins >= 60 ? `${mins / 60} hour(s)` : `${mins} min(s)`}
                </button>
              ))}
            </div>

            {/* Custom Minutes Input */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Or enter custom minutes:</label>
              <input
                type="number"
                min="1"
                value={timeoutMinutes}
                onChange={(e) => setTimeoutMinutes(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setTimeoutTargetUser(null)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTimeout}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer"
              >
                Apply Timeout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoModal;
