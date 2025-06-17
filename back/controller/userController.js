const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }


        const user = await User.findOne({ email });

        

        if (!user) {
            return res.status(401).send("Invalid email or password.");
        }

        console.log("User found:", user);

        try {
            const isMatch = await user.comparePassword(password);
            console.log("Password match result:", isMatch);

            if (!isMatch) {
                return res.status(401).send("Invalid email or password.");
            }
        } catch (compareErr) {
            console.error("Password compare error:", compareErr);
            return res.status(500).send("Error comparing password");
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.cookie("token", token, {
            maxAge: 60 * 1000
        });

        res.status(200).json({ message: 'Login successful!', user: { id: user._id, email: user.email  },token : token }); // Optional: useful if the frontend also needs the token

    } catch (err) {
        console.error("Outer login error:", err);
        res.status(500).send("Login error");
    }
};


exports.SignUp = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send("Email already registered.");


        await User.create({ name, email, password, role });

        res.json({ message: "signed up!" });

    } catch (err) {
        res.status(500).send(err);
    }

}