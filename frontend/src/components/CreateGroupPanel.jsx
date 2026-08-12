import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import {
  X,
  Users,
  Image as ImageIcon,
  Check,
  Search,
  Sparkles,
  UserPlus,
  ArrowLeft,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupPanel = () => {
  const { createGroup, setIsCreatingGroup } = useGroupStore();
  const { users, getUsers, isUsersLoading } = useChatStore();

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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-sky-50/50 backdrop-blur-xl overflow-y-auto">
      {/* Translucent Glassmorphism Card (Matches InvitePanel) */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white/50 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_20px_60px_rgba(14,165,233,0.18)] border border-white/80 overflow-hidden flex flex-col ring-1 ring-sky-500/20 transition-all my-auto">
        {/* Glass Gloss Shine Line */}
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/30 via-transparent to-transparent rotate-45 pointer-events-none" />

        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-5 sm:p-6 text-white text-center relative flex-shrink-0">
          <button
            onClick={() => setIsCreatingGroup(false)}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 border border-white/30 shadow-inner">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-wide">Create New Group</h2>
          <p className="text-xs text-blue-100 mt-0.5 sm:mt-1 font-medium">
            Connect and chat seamlessly with multiple friends
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/70 border-2 border-dashed border-sky-300/80 flex items-center justify-center shadow-inner relative overflow-hidden transition-all group-hover:border-blue-500">
                {groupPic ? (
                  <img src={groupPic} alt="Group Preview" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <label
                htmlFor="panel-group-pic-input"
                className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
              >
                <ImageIcon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold">Upload Photo</span>
              </label>
              <input
                id="panel-group-pic-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">Click to choose a group profile photo</p>
          </div>

          {/* Group Name Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Group Name *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Squad Goals, Weekend Trip, Project Alpha..."
              className="w-full bg-slate-100/80 border border-slate-200/80 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group chat about?"
              rows={2}
              className="w-full bg-slate-100/80 border border-slate-200/80 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all resize-none"
            />
          </div>

          {/* Member Selection Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Members ({selectedMemberIds.length})
              </label>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                👑 You are the Admin
              </span>
            </div>

            {/* Filter Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends by name or @username..."
                className="w-full bg-slate-100/80 border border-slate-200/80 pl-9 pr-3 py-2 text-xs text-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            {/* Members List Box */}
            <div className="max-h-48 overflow-y-auto bg-slate-50/60 border border-slate-200/70 rounded-2xl divide-y divide-slate-100">
              {isUsersLoading ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  Loading contacts...
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No friends found. Add friends first to select them for this group!
                </div>
              ) : (
                filteredFriends.map((user) => {
                  const isSelected = selectedMemberIds.includes(user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleMemberSelection(user._id)}
                      className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/90" : "hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{user.fullName}</p>
                          <p className="text-[10px] text-slate-500">@{user.username}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs"
                            : "border border-slate-300 bg-white"
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

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsCreatingGroup(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Create Group Chat"}</span>
            </button>
          </div>
        </form>

        {/* Card Footer Text */}
        <div className="bg-white/40 backdrop-blur-md px-4 sm:px-6 py-3 border-t border-white/60 text-center flex-shrink-0">
          <p className="text-[11px] text-slate-500 font-medium leading-normal">
            Group members will be notified and added instantly on creation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPanel;
