import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"
import crypto from "crypto";
import nodemailer from "nodemailer";

export const signup = async (req,res) => {
    const { fullName, username, email, password } = req.body;
    try {
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
            return res.status(400).json({ message: "Username can only contain letters, numbers, underscores, and dots" });
        }

        const existingEmail = await User.findOne({ 
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
        });
        const existingUsername = await User.findOne({ username: cleanUsername });

        if (existingEmail && existingUsername) {
            return res.status(400).json({ message: "Username already exists and email already exists" });
        }
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName.trim(),
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic,
                publicKey: newUser.publicKey,
                encryptedPrivateKey: newUser.encryptedPrivateKey,
                keySalt: newUser.keySalt,
                keyIv: newUser.keyIv,
                pinEncryptedPrivateKey: newUser.pinEncryptedPrivateKey,
                pinSalt: newUser.pinSalt,
                pinIv: newUser.pinIv,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        if (error.code === 11000) {
            const keys = Object.keys(error.keyPattern || error.keyValue || {});
            if (keys.includes("email") && keys.includes("username")) {
                return res.status(400).json({ message: "Username already exists and email already exists" });
            }
            if (keys.includes("email")) {
                return res.status(400).json({ message: "Email already exists" });
            }
            if (keys.includes("username")) {
                return res.status(400).json({ message: "Username already exists" });
            }
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req,res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const loginIdentifier = email.trim().toLowerCase();
        const user = await User.findOne({
            $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username || user.email.split("@")[0],
            email: user.email,
            profilePic: user.profilePic,
            publicKey: user.publicKey,
            encryptedPrivateKey: user.encryptedPrivateKey,
            keySalt: user.keySalt,
            keyIv: user.keyIv,
            pinEncryptedPrivateKey: user.pinEncryptedPrivateKey,
            pinSalt: user.pinSalt,
            pinIv: user.pinIv,
        });        
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req,res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req,res) => {
    try {
        const {profilePic} = req.body;
        const userid = req.user._id;

        if(!profilePic){
            return res.status(400).json({message: "Profile pic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userid, {profilePic:uploadResponse.secure_url}, {new:true}).select("-password");

        res.status(200).json({updatedUser});

    } catch (error) {
        console.log("Error in update profile: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "There is no user with that email address." });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        const emailTemplate = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 16px; color: #ffffff; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: 800;">YAPPR</h1>
                <div style="height: 3px; background: linear-gradient(to right, #475569, #94a3b8, #475569); width: 80px; margin: 15px auto; border-radius: 2px;"></div>
            </div>
            
            <p style="font-size: 18px; font-weight: 300; line-height: 1.6; color: #f1f5f9; margin-bottom: 24px;">
                Hello there,
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-bottom: 36px;">
                We received a request to reset the password for your Yappr account. No problem! Click the button below to set up a new password. If you didn't request this, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin-bottom: 40px;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1);">
                    RESET PASSWORD
                </a>
            </div>
            
            <div style="border-top: 1px solid #334155; padding-top: 24px;">
                <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0;">
                    Having trouble clicking the button? Copy and paste this link into your browser:
                </p>
                <p style="font-size: 14px; line-height: 1.6; margin-top: 8px;">
                    <a href="${resetUrl}" style="color: #60a5fa; word-break: break-all;">${resetUrl}</a>
                </p>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
                <p style="font-size: 13px; color: #64748b;">
                    Thanks for yappin' with us!<br>
                    &copy; ${new Date().getFullYear()} Yappr
                </p>
            </div>
        </div>
        `;

        if (process.env.NODE_ENV === "development") {
            console.log("Password Reset URL:", resetUrl);
        }

        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"Yappr Team" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "Reset your Yappr Password",
                    text: message,
                    html: emailTemplate,
                });
            } else {
                console.log("Email credentials not found in env. Email not sent, but reset token generated.");
            }

            res.status(200).json({ message: "Reset link sent! Please check your email or console." });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            console.log("Error sending email: ", error.message);
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        console.log("Error in forgotPassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const { password } = req.body;
        
        if (!password || password.length < 6) {
             return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Invalidate old password envelope since password has changed, but keep pinEncryptedPrivateKey intact!
        user.encryptedPrivateKey = null;
        user.keySalt = null;
        user.keyIv = null;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateE2EEKeys = async (req, res) => {
  try {
    const {
      publicKey,
      encryptedPrivateKey,
      keySalt,
      keyIv,
      pinEncryptedPrivateKey,
      pinSalt,
      pinIv,
    } = req.body;
    const userId = req.user._id;

    const updateFields = {};
    if (publicKey !== undefined) updateFields.publicKey = publicKey;
    if (encryptedPrivateKey !== undefined) updateFields.encryptedPrivateKey = encryptedPrivateKey;
    if (keySalt !== undefined) updateFields.keySalt = keySalt;
    if (keyIv !== undefined) updateFields.keyIv = keyIv;
    if (pinEncryptedPrivateKey !== undefined) updateFields.pinEncryptedPrivateKey = pinEncryptedPrivateKey;
    if (pinSalt !== undefined) updateFields.pinSalt = pinSalt;
    if (pinIv !== undefined) updateFields.pinIv = pinIv;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateE2EEKeys controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePublicKey = updateE2EEKeys;

export const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword,
            encryptedPrivateKey,
            keySalt,
            keyIv,
            pinEncryptedPrivateKey,
            pinSalt,
            pinIv,
        } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new passwords are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Atomically update the re-encrypted private key envelope with the new password
        if (encryptedPrivateKey !== undefined) user.encryptedPrivateKey = encryptedPrivateKey;
        if (keySalt !== undefined) user.keySalt = keySalt;
        if (keyIv !== undefined) user.keyIv = keyIv;
        if (pinEncryptedPrivateKey !== undefined) user.pinEncryptedPrivateKey = pinEncryptedPrivateKey;
        if (pinSalt !== undefined) user.pinSalt = pinSalt;
        if (pinIv !== undefined) user.pinIv = pinIv;

        await user.save();

        res.status(200).json({
            message: "Password updated successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                publicKey: user.publicKey,
                encryptedPrivateKey: user.encryptedPrivateKey,
                keySalt: user.keySalt,
                keyIv: user.keyIv,
                pinEncryptedPrivateKey: user.pinEncryptedPrivateKey,
                pinSalt: user.pinSalt,
                pinIv: user.pinIv,
            }
        });
    } catch (error) {
        console.error("Error in changePassword controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const recordPinAttempt = async (req, res) => {
    try {
        const { success } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.pinLockedUntil && user.pinLockedUntil > Date.now()) {
            const remainingMinutes = Math.ceil((user.pinLockedUntil - Date.now()) / 60000);
            return res.status(429).json({ message: `Too many failed PIN attempts. Locked for ${remainingMinutes} more minute(s).` });
        }

        if (success) {
            user.pinFailedAttempts = 0;
            user.pinLockedUntil = null;
        } else {
            user.pinFailedAttempts = (user.pinFailedAttempts || 0) + 1;
            if (user.pinFailedAttempts >= 5) {
                user.pinLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
            }
        }

        await user.save();
        res.status(200).json({
            pinFailedAttempts: user.pinFailedAttempts,
            pinLockedUntil: user.pinLockedUntil
        });
    } catch (error) {
        console.error("Error in recordPinAttempt controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};