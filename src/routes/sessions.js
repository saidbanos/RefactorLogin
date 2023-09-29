import { Router } from "express";
import { userModel } from "../dao/models/user.js";

const router = Router();

router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const user = await userModel.findOne({ email, password });
	if (!user) {
		return res.status(400).send({
			status: "error",
			message: "Invalid email or password.",
		});
	}

	req.session.user = {
		name: `${user.first_name} ${user.last_name}`,
		email: user.email,
		age: user.age,
	};

	if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
		req.session.user.role = "admin";
	} else {
		req.session.user.role = "user";
	}

	res.send({ status: "success", message: "Logged in successfully!" });
});

router.post("/register", async (req, res) => {
	const { first_name, last_name, email, age, password } = req.body;
	const exists = await userModel.findOne({ email });
	if (exists) {
		return res
			.status(400)
			.send({ status: "error", error: "Ya existe usuario con ese email" });
	}
	const user = {
		first_name,
		last_name,
		email,
		age,
		password,
	};
	let result = await userModel.create(user);
	res.redirect("/products");
});

router.get("/logout", (req, res) => {
	if (req.session) {
		req.session.destroy((error) => {
			if (error) {
				return res
					.status(500)
					.send({
						status: "error",
						message: "Couldn't log out. Please try again!",
					});
			}
			res.clearCookie("connect.sid");
			return res
				.status(200)
				.send({ status: "success", message: "Successfully logged out!" });
		});
	} else {
		return res
			.status(200)
			.send({ status: "info", message: "No active session found!" });
	}
});

export default router;
