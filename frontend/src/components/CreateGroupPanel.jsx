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
  Crown,
  UserCheck,
} from "lucide-react";
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
    <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto h-full ${
      isNeubrutalism
        ? "bg-[#FFFDF0] text-black"
        : "bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-sky-50/50 backdrop-blur-xl"
    }`}>
      {/* Spacious 2-Column Container */}
      <div className={`relative w-full max-w-4xl lg:max-w-5xl overflow-hidden flex flex-col transition-all my-auto max-h-[90vh] ${
        isNeubrutalism
          ? "bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none text-black"
          : "bg-white/70 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_20px_60px_rgba(14,165,233,0.18)] border border-white/80 ring-1 ring-sky-500/20"
      }`}>
        {/* Top Header */}
        <div className={`p-5 sm:p-6 relative flex-shrink-0 flex items-center justify-between ${
          isNeubrutalism
            ? "bg-[#FFE600] border-b-3 border-black text-black"
            : "bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 text-white"
        }`}>
          <div>
            <h2 className={isNeubrutalism ? "text-xl sm:text-2xl font-black uppercase tracking-wide text-black" : "text-xl sm:text-2xl font-extrabold tracking-wide text-white"}>Create New Group</h2>
            <p className={isNeubrutalism ? "text-xs sm:text-sm text-black font-bold mt-0.5" : "text-xs sm:text-sm text-blue-100 font-medium mt-0.5"}>
              Customize group details and select members for your community chat
            </p>
          </div>
          <button
            onClick={() => setIsCreatingGroup(false)}
            className={`p-2 transition-all cursor-pointer shrink-0 ${
              isNeubrutalism
                ? "bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold active:translate-x-0.5 active:translate-y-0.5"
                : "rounded-full bg-white/20 hover:bg-white/30 text-white hover:scale-105 active:scale-95"
            }`}
            title="Close"
          >
            <X className={`w-5 h-5 ${isNeubrutalism ? "stroke-[3]" : ""}`} />
          </button>
        </div>

        {/* 2-Column Content Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: Group Details & Submit (5 Cols) */}
            <div className="md:col-span-5 space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative group cursor-pointer">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative overflow-hidden transition-all ${
                      isNeubrutalism
                        ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                        : "rounded-3xl bg-slate-100 border-2 border-dashed border-sky-300/80 shadow-inner group-hover:border-blue-500 group-hover:shadow-md"
                    }`}>
                      {groupPic ? (
                        <img src={groupPic} alt="Group Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Users className={`w-10 h-10 ${isNeubrutalism ? "text-black" : "text-blue-400"}`} />
                      )}
                    </div>
                    <label
                      htmlFor="wide-group-pic-input"
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white ${
                        isNeubrutalism ? "bg-black/70 rounded-none font-black" : "bg-black/40 rounded-3xl"
                      }`}
                    >
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Upload Photo</span>
                    </label>
                    <input
                      id="wide-group-pic-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className={isNeubrutalism ? "text-[11px] text-black font-extrabold mt-2 uppercase" : "text-[11px] text-slate-500 font-medium mt-2"}>Click to select group icon</p>
                </div>

                {/* Group Name */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                    isNeubrutalism ? "text-black font-black" : "text-slate-700"
                  }`}>
                    <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isNeubrutalism ? "text-black" : "text-blue-600"}`} />
                    <span>Group Name *</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Project Team, Gaming Squad..."
                    className={`w-full px-4 py-3 text-sm transition-all outline-none ${
                      isNeubrutalism
                        ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold placeholder:text-black/50 focus:bg-[#FFE600]"
                        : "bg-slate-100/90 border border-slate-200/90 text-slate-800 font-medium rounded-2xl focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                    }`}
                    required
                  />
                </div>

                {/* Group Description */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${
                    isNeubrutalism ? "text-black font-black" : "text-slate-700"
                  }`}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's the topic of this group?"
                    rows={3}
                    className={`w-full px-4 py-2.5 text-sm transition-all outline-none resize-none ${
                      isNeubrutalism
                        ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold placeholder:text-black/50 focus:bg-[#FFE600]"
                        : "bg-slate-100/90 border border-slate-200/90 text-slate-800 font-medium rounded-2xl focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                    }`}
                  />
                </div>

                {/* Admin Status Info */}
                <div className={`p-3 flex items-center gap-2.5 ${
                  isNeubrutalism
                    ? "bg-[#00E5FF] border-2 border-black shadow-[3px_3px_0_#000] rounded-none text-black"
                    : "bg-blue-50/80 border border-blue-100 rounded-2xl"
                }`}>
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                    isNeubrutalism
                      ? "bg-black text-white border border-black rounded-none font-black"
                      : "rounded-xl bg-blue-600 text-white shadow-xs"
                  }`}>
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={isNeubrutalism ? "text-xs font-black uppercase text-black" : "text-xs font-bold text-blue-900"}>Admin Role Assigned</p>
                    <p className={isNeubrutalism ? "text-[11px] font-extrabold text-black/80" : "text-[11px] text-blue-700 font-medium"}>You will be the creator & admin</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`pt-4 flex items-center gap-3 justify-end ${
                isNeubrutalism ? "border-t-3 border-black" : "border-t border-slate-200/60"
              }`}>
                <button
                  type="button"
                  onClick={() => setIsCreatingGroup(false)}
                  className={`px-5 py-2.5 text-xs transition-colors cursor-pointer ${
                    isNeubrutalism
                      ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-black uppercase hover:bg-yellow-100"
                      : "font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className={`px-6 py-2.5 text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isNeubrutalism
                      ? "bg-[#00E676] text-black font-black uppercase border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 rounded-none"
                      : "font-bold text-white bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_75%,#38bdf8_100%)] border border-white/20 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] hover:brightness-110 disabled:opacity-50 active:scale-95"
                  }`}
                >
                  <Plus className={`w-4 h-4 ${isNeubrutalism ? "stroke-[3]" : "stroke-[2.5]"}`} />
                  <span>{isSubmitting ? "Creating..." : "Create Group Chat"}</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Member Selection (7 Cols) */}
            <div className={`md:col-span-7 p-4 sm:p-5 flex flex-col space-y-3.5 ${
              isNeubrutalism
                ? "bg-[#FFFDF0] border-3 border-black shadow-[4px_4px_0_#000] rounded-none text-black"
                : "bg-white/80 border border-slate-200/80 rounded-2xl shadow-xs"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-blue-600"}`} />
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${
                    isNeubrutalism ? "font-black text-black" : "text-slate-800"
                  }`}>
                    Select Group Members
                  </h3>
                </div>
                <span className={`px-3 py-1 text-xs font-bold ${
                  isNeubrutalism
                    ? "bg-[#FFE600] text-black border border-black font-black rounded-none"
                    : "bg-blue-100/80 text-blue-700 rounded-full border border-blue-200/60"
                }`}>
                  {selectedMemberIds.length} Selected
                </span>
              </div>

              {/* Search Friends Bar */}
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isNeubrutalism ? "text-black stroke-[2.5]" : "text-slate-400"
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends by name or @username..."
                  className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none transition-all ${
                    isNeubrutalism
                      ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold placeholder:text-black/60 focus:bg-[#FFE600]"
                      : "bg-slate-100/90 border border-slate-200/80 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                  }`}
                />
              </div>

              {/* Selected Member Chips Preview */}
              {selectedUsersList.length > 0 && (
                <div className={`flex flex-wrap gap-1.5 p-2 max-h-24 overflow-y-auto ${
                  isNeubrutalism
                    ? "bg-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                    : "bg-blue-50/50 border border-blue-100 rounded-xl"
                }`}>
                  {selectedUsersList.map((user) => (
                    <div
                      key={user._id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs ${
                        isNeubrutalism
                          ? "bg-[#FFE600] text-black border border-black font-extrabold rounded-none shadow-[1px_1px_0_#000]"
                          : "bg-white border border-blue-200 text-blue-800 rounded-full font-semibold shadow-2xs"
                      }`}
                    >
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className={`w-4 h-4 object-cover ${isNeubrutalism ? "rounded-none border border-black" : "rounded-full"}`}
                      />
                      <span className="max-w-[100px] truncate">{user.fullName}</span>
                      <button
                        type="button"
                        onClick={() => toggleMemberSelection(user._id)}
                        className={isNeubrutalism ? "text-black hover:text-red-600 font-black p-0.5" : "text-blue-400 hover:text-blue-700 p-0.5 rounded-full"}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Scrollable Friends Checkbox List */}
              <div className={`flex-1 max-h-[300px] sm:max-h-[340px] overflow-y-auto ${
                isNeubrutalism
                  ? "bg-white border-2 border-black rounded-none divide-y-2 divide-black"
                  : "bg-slate-50/70 border border-slate-200/70 rounded-2xl divide-y divide-slate-100"
              }`}>
                {isUsersLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    Loading contacts...
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className={`p-6 text-center text-xs ${isNeubrutalism ? "font-bold text-black opacity-70" : "text-slate-400 font-medium"}`}>
                    {searchQuery.trim()
                      ? `No friends matching "${searchQuery}"`
                      : "No friends available to add. Connect with friends first!"}
                  </div>
                ) : (
                  filteredFriends.map((user) => {
                    const isSelected = selectedMemberIds.includes(user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => toggleMemberSelection(user._id)}
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                          isNeubrutalism
                            ? isSelected ? "bg-[#FFE600] font-black" : "hover:bg-yellow-50"
                            : isSelected ? "bg-blue-50/90" : "hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className={`w-9 h-9 object-cover ${
                              isNeubrutalism ? "rounded-none border border-black shadow-[1px_1px_0_#000]" : "rounded-full border border-white shadow-xs"
                            }`}
                            onError={(e) => {
                              e.target.src = "/avatar.png";
                            }}
                          />
                          <div>
                            <p className={`text-xs ${isNeubrutalism ? "font-black text-black" : "font-bold text-slate-800"}`}>{user.fullName}</p>
                            <p className={`text-[11px] ${isNeubrutalism ? "font-bold text-black/80" : "font-medium text-slate-500"}`}>
                              @{user.username || user.email?.split("@")[0]}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 flex items-center justify-center transition-all ${
                            isNeubrutalism
                              ? isSelected
                                ? "bg-black text-white border-2 border-black rounded-none shadow-[1px_1px_0_#000]"
                                : "border-2 border-black bg-white rounded-none"
                              : isSelected
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs rounded-lg scale-105"
                                : "border border-slate-300 bg-white rounded-lg"
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
        </form>

        {/* Footer */}
        <div className={`px-6 py-2.5 text-center flex-shrink-0 ${
          isNeubrutalism
            ? "bg-[#FFE600] border-t-3 border-black text-black"
            : "bg-white/50 backdrop-blur-md border-t border-slate-200/60"
        }`}>
          <p className={isNeubrutalism ? "text-[11px] text-black font-extrabold uppercase" : "text-[11px] text-slate-500 font-medium"}>
            Members will receive instant channel access upon creation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPanel;
