import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getUserOnlineSockets } from "../lib/socket.js";

// Helper to sanitize expired timeouts
const cleanExpiredTimeouts = (group) => {
  if (!group.timeouts) return [];
  const now = new Date();
  return group.timeouts.filter((t) => new Date(t.until) > now);
};

// Helper to create and broadcast system messages in group chat
const createAndEmitSystemMessage = async (groupId, senderId, text) => {
  try {
    const sysMsg = new Message({
      senderId,
      groupId,
      text,
      isSystemMessage: true,
    });
    await sysMsg.save();
    const populatedMsg = await Message.findById(sysMsg._id).populate(
      "senderId",
      "fullName username profilePic email"
    );
    io.to(`group_${groupId}`).emit("newGroupMessage", populatedMsg);
  } catch (err) {
    console.error("Error creating system message:", err.message);
  }
};

// 1. Create a Group Chat
export const createGroup = async (req, res) => {
  try {
    const { name, description, groupPic, memberIds } = req.body;
    const creatorId = req.user._id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name is required" });
    }

    let imageUrl = "";
    if (groupPic && groupPic.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      imageUrl = uploadResponse.secure_url;
    } else if (groupPic) {
      imageUrl = groupPic;
    }

    // Ensure memberIds array includes creator and has valid IDs
    const parsedMemberIds = Array.isArray(memberIds) ? memberIds : [];
    const allMembers = Array.from(new Set([creatorId.toString(), ...parsedMemberIds]));

    const newGroup = new Group({
      name: name.trim(),
      description: description ? description.trim() : "",
      groupPic: imageUrl,
      createdBy: creatorId,
      admins: [creatorId],
      members: allMembers,
    });

    await newGroup.save();

    const populatedGroup = await Group.findById(newGroup._id)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    // Emit socket event to all online members
    const memberSocketIds = getUserOnlineSockets(allMembers);
    memberSocketIds.forEach((socketId) => {
      io.to(socketId).emit("groupCreated", populatedGroup);
    });

    // Create system message for group creation
    const actorName = req.user?.fullName || "A user";
    await createAndEmitSystemMessage(newGroup._id, creatorId, `${actorName} created group "${newGroup.name}"`);

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2. Fetch User's Groups with Last Message Info
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email")
      .lean();

    const groupIds = groups.map((g) => g._id);

    // Aggregate to get the last message for each group
    const lastMessages = await Message.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$groupId",
          lastMessageTime: { $first: "$createdAt" },
          lastMessageText: { $first: "$text" },
          senderId: { $first: "$senderId" },
          isDeleted: { $first: "$isDeleted" },
        },
      },
    ]);

    const lastMsgMap = {};
    lastMessages.forEach((item) => {
      lastMsgMap[item._id.toString()] = item;
    });

    const groupsWithLastMsg = groups.map((group) => {
      const activeTimeouts = cleanExpiredTimeouts(group);
      const userTimeoutObj = activeTimeouts.find(
        (t) => t.userId.toString() === userId.toString()
      );
      
      const isTimedOut = Boolean(userTimeoutObj && new Date(userTimeoutObj.until) > new Date());
      const timeoutUntil = userTimeoutObj ? userTimeoutObj.until : null;

      return {
        ...group,
        timeouts: activeTimeouts,
        lastMessageTime: lastMsgMap[group._id.toString()]?.lastMessageTime || null,
        lastMessageText: lastMsgMap[group._id.toString()]?.isDeleted
          ? "This message was deleted"
          : lastMsgMap[group._id.toString()]?.lastMessageText || null,
        userTimeout: {
          isTimedOut,
          until: timeoutUntil,
        },
      };
    });

    // Sort groups by last message time descending, then group creation time
    groupsWithLastMsg.sort((a, b) => {
      const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    res.status(200).json(groupsWithLastMsg);
  } catch (error) {
    console.error("Error in getUserGroups controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 3. Get Group Details
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some((m) => m._id.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ message: "Not authorized to view this group" });
    }

    // Clean expired timeouts
    const activeTimeouts = cleanExpiredTimeouts(group);
    if (activeTimeouts.length !== group.timeouts.length) {
      group.timeouts = activeTimeouts;
      await group.save();
    }

    const myTimeout = activeTimeouts.find((t) => t.userId.toString() === userId.toString());
    const isTimedOut = Boolean(myTimeout && new Date(myTimeout.until) > new Date());

    res.status(200).json({
      group,
      userTimeout: {
        isTimedOut,
        until: myTimeout ? myTimeout.until : null,
      },
    });
  } catch (error) {
    console.error("Error in getGroupDetails controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 4. Update Group Info (Name, Description, GroupPic)
export const updateGroupInfo = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, groupPic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some((m) => m.toString() === userId.toString());
    if (!isMember) return res.status(403).json({ message: "Not a member of this group" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    const isCreator = Boolean(group.createdBy && (group.createdBy._id || group.createdBy).toString() === userId.toString());
    const isAdmin = isCreator || (group.admins || []).some((a) => (a._id || a)?.toString() === userId.toString());
    if (!isAdmin && !group.permissions?.allowMembersToEditGroupInfo) {
      return res.status(403).json({ message: "Only group admins are allowed to edit group info" });
    }

    // Check if user is currently timed out
    const activeTimeouts = cleanExpiredTimeouts(group);
    const userTimeout = activeTimeouts.find((t) => (t.userId?._id || t.userId)?.toString() === userId.toString());
    if (userTimeout && new Date(userTimeout.until) > new Date()) {
      return res.status(403).json({ message: "You are currently timed out and cannot update group info" });
    }

    const nameChanged = Boolean(name && name.trim() && name.trim() !== group.name);
    const descChanged = typeof description === "string" && description.trim() !== group.description;
    const picChanged = Boolean(groupPic && groupPic !== group.groupPic);

    if (name && name.trim()) group.name = name.trim();
    if (typeof description === "string") group.description = description.trim();

    if (groupPic && groupPic.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      group.groupPic = uploadResponse.secure_url;
    } else if (groupPic !== undefined) {
      group.groupPic = groupPic;
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    const actorName = req.user?.fullName || "An admin";
    if (nameChanged) {
      await createAndEmitSystemMessage(groupId, userId, `${actorName} changed group name to "${group.name}"`);
    }
    if (picChanged) {
      await createAndEmitSystemMessage(groupId, userId, `${actorName} updated group photo`);
    }
    if (descChanged) {
      await createAndEmitSystemMessage(groupId, userId, `${actorName} updated group description`);
    }

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroupInfo controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 5. Update Group Permissions (Admin Only)
export const updateGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { permissions } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    const isCreator = Boolean(group.createdBy && (group.createdBy._id || group.createdBy).toString() === userId.toString());
    const isAdmin = isCreator || (group.admins || []).some((a) => (a._id || a)?.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only group admins can update permissions" });
    }

    if (permissions) {
      if (typeof permissions.allowMembersToEditGroupInfo === "boolean") {
        group.permissions.allowMembersToEditGroupInfo = permissions.allowMembersToEditGroupInfo;
      }
      if (typeof permissions.allowMembersToSendMessages === "boolean") {
        group.permissions.allowMembersToSendMessages = permissions.allowMembersToSendMessages;
      }
      if (typeof permissions.allowMembersToAddOthers === "boolean") {
        group.permissions.allowMembersToAddOthers = permissions.allowMembersToAddOthers;
      }
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    const actorName = req.user?.fullName || "An admin";
    await createAndEmitSystemMessage(groupId, userId, `${actorName} updated group permissions`);

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroupPermissions controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 6. Add Members to Group
export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    const isCreator = Boolean(group.createdBy && (group.createdBy._id || group.createdBy).toString() === userId.toString());
    const isAdmin = isCreator || (group.admins || []).some((a) => (a._id || a)?.toString() === userId.toString());
    if (!isAdmin && !group.permissions?.allowMembersToAddOthers) {
      return res.status(403).json({ message: "Only group admins can add new members" });
    }

    const newMemberIds = Array.isArray(memberIds) ? memberIds : [];
    newMemberIds.forEach((id) => {
      if (!group.members.some((m) => m.toString() === id.toString())) {
        group.members.push(id);
      }
    });

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    // Also notify newly added members
    const newMemberSocketIds = getUserOnlineSockets(newMemberIds);
    newMemberSocketIds.forEach((sId) => {
      io.to(sId).emit("groupCreated", updatedGroup);
    });

    res.status(200).json(updatedGroup);

    const addedUsers = await User.find({ _id: { $in: newMemberIds } });
    const addedNames = addedUsers.map((u) => u.fullName).filter(Boolean).join(", ");
    if (addedNames) {
      const actorName = req.user?.fullName || "An admin";
      await createAndEmitSystemMessage(groupId, userId, `${actorName} added ${addedNames} to the group`);
    }
  } catch (error) {
    console.error("Error in addMembers controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 7. Remove Member from Group (Admin Only)
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId: memberIdToRemove } = req.params;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    const isCreator = Boolean(group.createdBy && (group.createdBy._id || group.createdBy).toString() === adminId.toString());
    const isAdmin = isCreator || (group.admins || []).some((a) => (a._id || a)?.toString() === adminId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    // Cannot remove group creator
    if (group.createdBy && (group.createdBy._id || group.createdBy).toString() === memberIdToRemove.toString()) {
      return res.status(400).json({ message: "The initial group creator cannot be removed from the group" });
    }

    const removedUser = await User.findById(memberIdToRemove);
    const removedName = removedUser ? removedUser.fullName : "a member";

    group.members = group.members.filter((m) => m.toString() !== memberIdToRemove.toString());
    group.admins = group.admins.filter((a) => a.toString() !== memberIdToRemove.toString());
    group.timeouts = group.timeouts.filter((t) => (t.userId?._id || t.userId)?.toString() !== memberIdToRemove.toString());

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    const actorName = req.user?.fullName || "An admin";
    await createAndEmitSystemMessage(groupId, adminId, `${actorName} removed ${removedName} from the group`);

    // Notify removed user
    const removedSocketId = getUserOnlineSockets([memberIdToRemove])[0];
    if (removedSocketId) {
      io.to(removedSocketId).emit("groupMemberRemoved", { groupId, userId: memberIdToRemove });
    }

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in removeMember controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 8. Toggle Admin Role (Promote / Demote) (Admin Only)
export const toggleAdminRole = async (req, res) => {
  try {
    const { groupId, userId: targetUserId } = req.params;
    const { isAdmin } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    const isCreator = Boolean(group.createdBy && (group.createdBy._id || group.createdBy).toString() === adminId.toString());
    const isCallerAdmin = isCreator || (group.admins || []).some((a) => (a._id || a)?.toString() === adminId.toString());
    if (!isCallerAdmin) {
      return res.status(403).json({ message: "Only admins can modify admin roles" });
    }

    // Cannot demote group creator
    if (group.createdBy && (group.createdBy._id || group.createdBy).toString() === targetUserId.toString() && !isAdmin) {
      return res.status(400).json({ message: "The initial group creator is a permanent admin" });
    }

    const targetUser = await User.findById(targetUserId);
    const targetName = targetUser ? targetUser.fullName : "a member";

    if (isAdmin) {
      if (!group.admins.some((a) => (a._id || a)?.toString() === targetUserId.toString())) {
        group.admins.push(targetUserId);
      }
    } else {
      group.admins = group.admins.filter((a) => (a._id || a)?.toString() !== targetUserId.toString());
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    const actorName = req.user?.fullName || "An admin";
    const roleAction = isAdmin ? "made" : "removed";
    const roleTitle = isAdmin ? "an admin" : "as admin";
    await createAndEmitSystemMessage(groupId, adminId, `${actorName} ${roleAction} ${targetName} ${roleTitle}`);

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in toggleAdminRole controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 9. Timeout Member (Admin Only)
export const timeoutMember = async (req, res) => {
  try {
    const { groupId, userId: targetUserId } = req.params;
    const { durationMinutes } = req.body;
    const adminId = req.user._id;

    if (!durationMinutes || Number(durationMinutes) <= 0) {
      return res.status(400).json({ message: "A valid positive timeout duration in minutes is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    const isCreator = Boolean(group.createdBy && (group.createdBy._id || group.createdBy).toString() === adminId.toString());
    const isCallerAdmin = isCreator || (group.admins || []).some((a) => (a._id || a)?.toString() === adminId.toString());
    if (!isCallerAdmin) {
      return res.status(403).json({ message: "Only admins can give timeout to members" });
    }

    // Cannot timeout group creator
    if (group.createdBy && (group.createdBy._id || group.createdBy).toString() === targetUserId.toString()) {
      return res.status(400).json({ message: "The initial group creator cannot be timed out" });
    }

    // Calculate timeout expiration
    const until = new Date(Date.now() + Number(durationMinutes) * 60 * 1000);

    const targetUser = await User.findById(targetUserId);
    const targetName = targetUser ? targetUser.fullName : "a member";

    // Remove any existing timeout entry for target user
    group.timeouts = group.timeouts.filter((t) => (t.userId?._id || t.userId)?.toString() !== targetUserId.toString());

    // Push new timeout
    group.timeouts.push({
      userId: targetUserId,
      until,
      setBy: adminId,
    });

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    const payload = {
      groupId,
      userId: targetUserId,
      until,
      durationMinutes: Number(durationMinutes),
      setBy: adminId,
    };

    io.to(`group_${groupId}`).emit("groupMemberTimeout", payload);
    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    const actorName = req.user?.fullName || "An admin";
    await createAndEmitSystemMessage(groupId, adminId, `${actorName} placed ${targetName} on timeout for ${durationMinutes} minute(s)`);

    res.status(200).json({ message: "Member timed out successfully", group: updatedGroup, timeout: payload });
  } catch (error) {
    console.error("Error in timeoutMember controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 10. Remove Timeout Early (Admin Only)
export const removeTimeout = async (req, res) => {
  try {
    const { groupId, userId: targetUserId } = req.params;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    const isCreator = Boolean(group.createdBy && (group.createdBy._id || group.createdBy).toString() === adminId.toString());
    const isCallerAdmin = isCreator || (group.admins || []).some((a) => (a._id || a)?.toString() === adminId.toString());
    if (!isCallerAdmin) {
      return res.status(403).json({ message: "Only admins can remove member timeouts" });
    }

    const targetUser = await User.findById(targetUserId);
    const targetName = targetUser ? targetUser.fullName : "a member";

    group.timeouts = group.timeouts.filter((t) => (t.userId?._id || t.userId)?.toString() !== targetUserId.toString());
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    const payload = {
      groupId,
      userId: targetUserId,
      until: null,
    };

    io.to(`group_${groupId}`).emit("groupMemberTimeout", payload);
    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    const actorName = req.user?.fullName || "An admin";
    await createAndEmitSystemMessage(groupId, adminId, `${actorName} removed timeout for ${targetName}`);

    res.status(200).json({ message: "Timeout removed successfully", group: updatedGroup });
  } catch (error) {
    console.error("Error in removeTimeout controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 11. Leave Group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.createdBy && group.members.length > 0) {
      group.createdBy = (group.admins || [])[0] || group.members[0];
    }

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== userId.toString());
    group.timeouts = group.timeouts.filter((t) => (t.userId?._id || t.userId)?.toString() !== userId.toString());

    // If remaining members exist and creator is leaving, assign new creator
    if (group.members.length > 0 && group.createdBy && (group.createdBy._id || group.createdBy).toString() === userId.toString()) {
      const nextAdmin = group.admins[0] || group.members[0];
      group.createdBy = nextAdmin;
      if (!group.admins.some((a) => a.toString() === nextAdmin.toString())) {
        group.admins.push(nextAdmin);
      }
    }

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      io.to(`group_${groupId}`).emit("groupDeleted", { groupId });
      return res.status(200).json({ message: "Group deleted as last member left" });
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username profilePic email")
      .populate("admins", "fullName username profilePic email")
      .populate("members", "fullName username profilePic email");

    io.to(`group_${groupId}`).emit("groupUpdated", updatedGroup);

    const actorName = req.user?.fullName || "A member";
    await createAndEmitSystemMessage(groupId, userId, `${actorName} left the group`);

    res.status(200).json({ message: "Successfully left group" });
  } catch (error) {
    console.error("Error in leaveGroup controller: ", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
