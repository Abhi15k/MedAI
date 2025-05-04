import User from "../../models/userModel.js";

export default async function updateFcmToken(req, res) {
    const { userId, fcmToken } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { fcmToken: fcmToken }, { new: true });
        res.status(200).json({ message: "Token saved" });
    } catch (err) {
        console.error("Error saving token:", err);
        res.status(500).json({ error: "Could not save token" });
    }
}