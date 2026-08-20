import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        publicKey: {
            type: Object,
            default: null,
        },
        // Password-encrypted backup
        encryptedPrivateKey: {
            type: String,
            default: null,
        },
        keySalt: {
            type: String,
            default: null,
        },
        keyIv: {
            type: String,
            default: null,
        },
        // 6-Digit PIN backup (recovery safety net)
        pinEncryptedPrivateKey: {
            type: String,
            default: null,
        },
        pinSalt: {
            type: String,
            default: null,
        },
        pinIv: {
            type: String,
            default: null,
        },
        pinFailedAttempts: {
            type: Number,
            default: 0,
        },
        pinLockedUntil: {
            type: Date,
            default: null,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;