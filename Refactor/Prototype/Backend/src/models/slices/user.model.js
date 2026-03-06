import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt'
import { ENV } from "../../lib/env.js";

const userschema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        }
    },
    githubId: String,
    githubUsername: String,
    githubAccessToken: String,
    provider: {
        type: String,
        enum: ["local", "github"],
        default: "local"
    },
    githubId: String,
    githubUsername: String,
    profilePic: {
        type: String,
        default: ""
    },
    profilefileid: {
        type: String
    },
    refreshtoken: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
},{
    timestamps: true
})

// hash passwrd before save
userschema.pre("save", async function () {
    if (this.provider !== "local") return; 
    if (!this.isModified("password")) return;
    
    if (!this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});


// compare hash and userEntered Password
userschema.methods.checkpassword = async function (oldpassword) {
    const result1 = await bcrypt.compare(oldpassword, this.password);
    return result1;
};


// make accesstoken
userschema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            verified: this.verified
        },
        ENV.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ENV.ACCESS_TOKEN_EXPIRY,
        }
    );
};


userschema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        ENV.REFRESH_TOKEN_SECRET,
        {
            expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userschema)