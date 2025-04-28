import { validationResult } from "express-validator";
import { registerValidator, loginValidator } from "../../utils/userValidator.js";
import User from "../../models/userModel.js";

export const register = async (req, res) => {
    await Promise.all(registerValidator.map(validator => validator.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        console.log("Existing User:", existingUser);

        if (existingUser) {
            return res.status(400).json({ message: `User with email ${email} already exists. Try to login.` });
        }

        const newUser = new User({
            name,
            email,
            password,
            role
        })

        await newUser.save();

        res.status(201).json({ message: `User with email ${email} created successfully` });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const login = async (req, res) => {
    await Promise.all(loginValidator.map(validator => validator.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log("User:", user);

        if (!user) {
            return res.status(404).json({ message: `${email} does not exist try creating an account` });
        }

        const isMatch = await user.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }
        
        const token = 
        res.status(200).json({ message: `logged in successfully: ${email} ` });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}