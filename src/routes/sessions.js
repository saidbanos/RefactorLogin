import { Router } from "express";
import { userModel } from "../dao/models/user.js";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";

const router = Router();

router.get('/github', passport.authenticate('github', {scope: ['user:email']}) ,async (req, res) => {})

router.get('/githubCallback', passport.authenticate('github', {failureRedirect:'/loginFailed'}) ,async (req, res) => {
    req.session.user = req.user;
    res.redirect('/products')
})

router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const user = await userModel.findOne({ email });
	if (!user) {
		return res.status(400).send({
			status: "error",
			message: "Invalid email",
		});
	}

    if (!isValidPassword(user, password)) {
        return res.status(401).send({ status: 'error', error: 'Contraseña incorrecta' })
    }
    delete user.password;
    req.session.user = user

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

	res.send({ status: "success", payload: req.session.user });
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
		password: createHash(password)
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

router.post('/restartPassword', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ status: "error", error: "Datos incompletos" });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(404).send({ status: "error", error: "No existe el usuario" });
    }
    const passwordHash = createHash(password);
    await userModel.updateOne({ email }, { $set: { password: passwordHash } })
})

export default router;
