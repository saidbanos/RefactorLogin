import { Router } from "express";
import CartManager from "../dao/dbMongo/carts.js";

const router = Router();
const cartManager = new CartManager();

router.use((req, res, next) => {
	console.log("INFO: Running from carts.js");
	next();
});

router.get("/:cid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const cart = await cartManager.getCartById(cid);
		if (cart) {
			res.send(cart);
		} else {
			res.status(404).send(`Cart with id ${cid} not found`);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.post("/", async (req, res) => {
	try {
		const result = await cartManager.createNewCart();
		res.status(201).send(result);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.post("/:cid/product/:pid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;

		const result = await cartManager.addProductToCart(cid, pid);

		if (result.error) {
			res.status(404).send(result.error);
		} else {
			res.status(200).send(result);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.delete("/:cid/product/:pid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;

		const result = await cartManager.removeProductFromCart(cid, pid);

		if (result.error) {
			res.status(400).send(result.error);
		} else {
			res.status(200).send(result);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.put("/:cid", async (req, res) => {
	try {
		const updatedCart = await cartManager.updateCartProducts(
			req.params.cid,
			req.body
		);
		res.send(updatedCart);
	} catch (error) {
		console.error("Error in PUT /:cid:", error.message);
		res.status(500).send(`Internal server error: ${error.message}`);
	}
});

router.put("/:cid/product/:pid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;
		const quantity = req.body.quantity;

		const result = await cartManager.updateProductQuantity(cid, pid, quantity);

		if (result.error) {
			res.status(400).send(result.error);
		} else {
			res.status(200).send(result);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.delete("/:cid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const result = await cartManager.removeAllProductsFromCart(cid);

		if (result.error) {
			res.status(400).send(result.error);
		} else {
			res.status(200).send(result);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

export default router;
