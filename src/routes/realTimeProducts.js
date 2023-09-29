import { Router } from "express";
import { productsModel } from "../dao/models/products.js";
import MessageManager from "../dao/dbMongo/messages.js";

const realTimeProductsRoute = ({ socketServer, productManager }) => {
	const router = Router();
	const messageManager = new MessageManager();

	router.get("/", async (req, res) => {
		const productDocs = await productsModel.find();
		const products = productDocs.map((doc) => {
			const obj = doc.toObject();
			obj.id = obj._id;
			return obj;
		});

		const allMessages = await messageManager.getAllMessages();

		res.render("realTimeProducts", {
			products: products,
			allMessages: allMessages,
		});
	});

	return router;
};

export default realTimeProductsRoute;
