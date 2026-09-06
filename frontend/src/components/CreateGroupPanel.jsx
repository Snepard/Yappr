import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  X,
  Users,
  Image as ImageIcon,
  Check,
  Search,
  Sparkles,
  UserPlus,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CreateGroupPanel = () => {
  const { createGroup, setIsCreatingGroup } = useGroupStore();
  const { users, getUsers, isUsersLoading } = useChatStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupPic, setGroupPic] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setGroupPic(reader.result);
    };
  };

  const toggleMemberSelection = (userId) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredFriends = safeUsers.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsersList = safeUsers.filter((u) => selectedMemberIds.includes(u._id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setIsSubmitting(true);
    const result = await createGroup({
      name: name.trim(),
      description: description.trim(),
      groupPic,
      memberIds: selectedMemberIds,
    });
    setIsSubmitting(false);

    if (result) {
      setIsCreatingGroup(false);
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
      {/* Standardized Outer Frame Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={`relative w-full h-full sm:h-[680px] md:h-[690px] sm:max-h-[92vh] max-w-3xl lg:max-w-4xl xl:max-w-5xl overflow-hidden flex flex-col transition-all ${
          isNeubrutalism
            ? "bg-white border-0 sm:border-4 border-black shadow-none sm:shadow-[8px_8px_0_#000] rounded-none text-black"
            : "bg-white/95 sm:bg-white/85 sm:backdrop-blur-2xl sm:backdrop-saturate-200 rounded-none sm:rounded-3xl shadow-none sm:shadow-[0_20px_60px_rgba(14,165,233,0.15)] border-0 sm:border sm:border-white/90 sm:ring-1 sm:ring-sky-500/15"
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
              <Users className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h2
                className={`text-lg sm:text-2xl font-black tracking-tight truncate ${
                  isNeubrutalism ? "uppercase text-black" : "text-white"
                }`}
              >
                Create New Group
              </h2>
              <p
                className={`text-xs sm:text-sm truncate mt-0.5 sm:mt-1 ${
                  isNeubrutalism ? "text-black/80 font-bold" : "text-blue-100 font-medium"
                }`}
              >
                Set up your group details and add members
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingGroup(false)}
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

        {/* Divided Form Body (No outer scroll on desktop, cleanly parted into 2 columns) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row min-h-0">
            {/* ═════ PART 1 (LEFT): GROUP DETAILS ═════ */}
            <div
              className={`w-full md:w-[320px] lg:w-[360px] shrink-0 p-4 sm:p-6 flex flex-col justify-between space-y-4 overflow-y-auto md:overflow-hidden ${
                isNeubrutalism
                  ? "border-b-2 md:border-b-0 md:border-r-4 border-black bg-[#FFFDF0]"
                  : "border-b md:border-b-0 md:border-r border-slate-200/80 bg-slate-50/40"
              }`}
            >
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-blue-600"}`} />
                <h3
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isNeubrutalism ? "font-black text-black" : "text-slate-800"
                  }`}
                >
                  Group Details
                </h3>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center py-1 shrink-0">
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center relative overflow-hidden transition-all ${
                      isNeubrutalism
                        ? "bg-white border-3 border-black shadow-[4px_4px_0_#000] rounded-none"
                        : "rounded-3xl bg-white border-2 border-dashed border-sky-300 shadow-md group-hover:border-blue-500 group-hover:shadow-lg transition-all"
                    }`}
                  >
                    {groupPic ? (
                      <img src={groupPic} alt="Group Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Users className={`w-9 h-9 sm:w-10 sm:h-10 ${isNeubrutalism ? "text-black" : "text-blue-400"}`} />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="wide-group-pic-input"
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white ${
                      isNeubrutalism ? "bg-black/75 rounded-none font-black" : "bg-black/50 backdrop-blur-xs rounded-3xl"
                    }`}
                  >
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Change Icon</span>
                  </label>
                  <input
                    id="wide-group-pic-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p
                  className={`text-[11px] mt-1.5 text-center ${
                    isNeubrutalism ? "text-black font-extrabold uppercase" : "text-slate-500 font-medium"
                  }`}
                >
                  {groupPic ? "Click icon to change photo" : "Upload group profile photo"}
                </p>
              </div>

              {/* Name + Description Inputs */}
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <div>
                  <label
                    className={`text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                      isNeubrutalism ? "text-black font-black" : "text-slate-700 font-semibold"
                    }`}
                  >
                    <span>Group Name *</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Project Team, Gaming Squad..."
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm transition-all outline-none ${
                      isNeubrutalism
                        ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold placeholder:text-black/50 focus:bg-[#FFE600]"
                        : "bg-white/90 border border-slate-200 text-slate-800 font-medium rounded-xl shadow-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label
                    className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${
                      isNeubrutalism ? "text-black font-black" : "text-slate-700 font-semibold"
                    }`}
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this group about?"
                    rows={2}
                    className={`w-full px-3.5 py-2 text-xs sm:text-sm transition-all outline-none resize-none ${
                      isNeubrutalism
                        ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold placeholder:text-black/50 focus:bg-[#FFE600]"
                        : "bg-white/90 border border-slate-200 text-slate-800 font-medium rounded-xl shadow-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                    }`}
                  />
                </div>
              </div>

              {/* Tip box at bottom of left column */}
              <div
                className={`p-3 shrink-0 ${
                  isNeubrutalism
                    ? "bg-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                    : "bg-blue-50/70 border border-blue-100/90 rounded-xl shadow-2xs"
                }`}
              >
                <p
                  className={`text-[11px] leading-relaxed ${
                    isNeubrutalism ? "text-black font-bold" : "text-blue-800 font-medium"
                  }`}
                >
                  💡 <span className="font-bold">Tip:</span> Set a custom icon and name so your friends can instantly identify the channel.
                </p>
              </div>
            </div>

            {/* ═════ PART 2 (RIGHT): MEMBER SELECTION ═════ */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-0 space-y-3 overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <UserPlus className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-blue-600"}`} />
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isNeubrutalism ? "font-black text-black" : "text-slate-800"
                    }`}
                  >
                    Add Members
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold ${
                    isNeubrutalism
                      ? "bg-[#FFE600] text-black border-2 border-black font-black rounded-none shadow-[1px_1px_0_#000]"
                      : "bg-blue-100/90 text-blue-700 rounded-full border border-blue-200/80 font-semibold"
                  }`}
                >
                  {selectedMemberIds.length} selected
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search
                  className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isNeubrutalism ? "text-black stroke-[2.5]" : "text-slate-400"
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends by name or username..."
                  className={`w-full pl-8.5 pr-3 py-2 text-xs sm:text-sm outline-none transition-all ${
                    isNeubrutalism
                      ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold placeholder:text-black/60 focus:bg-[#FFE600]"
                      : "bg-white border border-slate-200/90 text-slate-800 rounded-xl shadow-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                  }`}
                />
              </div>

              {/* Selected Member Chips */}
              <AnimatePresence>
                {selectedUsersList.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="shrink-0 overflow-hidden"
                  >
                    <div
                      className={`flex flex-wrap gap-1.5 p-2 max-h-18 overflow-y-auto ${
                        isNeubrutalism
                          ? "bg-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                          : "bg-blue-50/60 border border-blue-100/80 rounded-xl"
                      }`}
                    >
                      {selectedUsersList.map((user) => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] ${
                            isNeubrutalism
                              ? "bg-[#FFE600] text-black border border-black font-extrabold rounded-none shadow-[1px_1px_0_#000]"
                              : "bg-white border border-blue-200 text-blue-800 rounded-full font-semibold shadow-2xs"
                          }`}
                        >
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className={`w-3.5 h-3.5 object-cover ${
                              isNeubrutalism ? "rounded-none border border-black" : "rounded-full"
                            }`}
                          />
                          <span className="max-w-[85px] truncate">{user.fullName}</span>
                          <button
                            type="button"
                            onClick={() => toggleMemberSelection(user._id)}
                            className={
                              isNeubrutalism
                                ? "text-black hover:text-red-600 font-black p-0.5 cursor-pointer"
                                : "text-blue-400 hover:text-blue-700 p-0.5 rounded-full cursor-pointer"
                            }
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Friends List (Internally scrollable so page remains locked in 1 screen) */}
              <div
                className={`flex-1 min-h-0 overflow-y-auto ${
                  isNeubrutalism
                    ? "bg-white border-2 border-black rounded-none divide-y-2 divide-black shadow-[2px_2px_0_#000]"
                    : "bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 shadow-xs"
                }`}
              >
                {isUsersLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">Loading contacts...</div>
                ) : filteredFriends.length === 0 ? (
                  <div
                    className={`p-6 text-center text-xs ${
                      isNeubrutalism ? "font-bold text-black opacity-70" : "text-slate-400 font-medium"
                    }`}
                  >
                    {searchQuery.trim()
                      ? `No friends matching "${searchQuery}"`
                      : "No friends available to add."}
                  </div>
                ) : (
                  filteredFriends.map((user) => {
                    const isSelected = selectedMemberIds.includes(user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => toggleMemberSelection(user._id)}
                        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                          isNeubrutalism
                            ? isSelected
                              ? "bg-[#FFE600] font-black"
                              : "hover:bg-yellow-50"
                            : isSelected
                            ? "bg-blue-50/90"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className={`w-8 h-8 object-cover shrink-0 ${
                              isNeubrutalism
                                ? "rounded-none border border-black shadow-[1px_1px_0_#000]"
                                : "rounded-full border border-white shadow-xs"
                            }`}
                            onError={(e) => {
                              e.target.src = "/avatar.png";
                            }}
                          />
                          <div className="min-w-0">
                            <p
                              className={`text-xs truncate ${
                                isNeubrutalism ? "font-black text-black" : "font-bold text-slate-800"
                              }`}
                            >
                              {user.fullName}
                            </p>
                            <p
                              className={`text-[10px] truncate ${
                                isNeubrutalism ? "font-bold text-black/80" : "font-medium text-slate-500"
                              }`}
                            >
                              @{user.username || user.email?.split("@")[0]}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 flex items-center justify-center shrink-0 transition-all ${
                            isNeubrutalism
                              ? isSelected
                                ? "bg-black text-white border-2 border-black rounded-none shadow-[1px_1px_0_#000]"
                                : "border-2 border-black bg-white rounded-none"
                              : isSelected
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs rounded-md scale-105"
                              : "border-2 border-slate-300 bg-white rounded-md"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Fixed Action Bar at Bottom */}
          <div
            className={`px-4 py-3 sm:px-7 sm:py-4 flex items-center justify-between flex-shrink-0 ${
              isNeubrutalism
                ? "bg-[#FFFDF0] border-t-2 sm:border-t-4 border-black"
                : "bg-white/90 backdrop-blur-md border-t border-slate-200/80"
            }`}
          >
            <p
              className={`text-xs hidden sm:block ${
                isNeubrutalism ? "text-black font-extrabold" : "text-slate-500 font-medium"
              }`}
            >
              {selectedMemberIds.length > 0
                ? `${selectedMemberIds.length} member${selectedMemberIds.length > 1 ? "s" : ""} selected for this group`
                : "Select members to add to the group"}
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={() => setIsCreatingGroup(false)}
                className={`px-4 py-2 text-xs transition-colors cursor-pointer ${
                  isNeubrutalism
                    ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-black uppercase hover:bg-yellow-100"
                    : "font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                }`}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className={`px-5 py-2.5 text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isNeubrutalism
                    ? "bg-[#00E676] text-black font-black uppercase border-3 border-black shadow-[3px_3px_0_#000] disabled:opacity-50 rounded-none active:translate-x-0.5 active:translate-y-0.5"
                    : "font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 border border-white/20 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] disabled:opacity-50 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
                }`}
              >
                <Plus className={`w-4 h-4 ${isNeubrutalism ? "stroke-[3]" : "stroke-[2.5]"}`} />
                <span>{isSubmitting ? "Creating..." : "Create Group"}</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGroupPanel;

