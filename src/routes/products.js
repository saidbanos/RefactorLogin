import { Router } from "express";
import ProductManager from "../dao/dbMongo/products.js";
import path from "path";
import __dirname from "../utils.js";
import { productsModel } from "../dao/models/products.js";

const router = Router();

const productsPath = path.join(__dirname, "..", "src", "productos.json");

const productManager = new ProductManager();

router.use((req, res, next) => {
	console.log("INFO: Running from products.js");
	next();
});

router.get("/", async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 10;
		const page = parseInt(req.query.page) || 1;
		const sortOrder = req.query.sort === "desc" ? -1 : 1;
		let sort = {};
		if (req.query.sort) {
			sort.price = sortOrder;
		}

		const query = {};
		if (req.query.query) {
			if (req.query.query === "instock") {
				query.stock = { $gt: 0 };
			} else {
				query.category = req.query.query;
			}
		}

		const options = {
			page: page,
			limit: limit,
			sort: sort,
		};

		const result = await productsModel.paginate(query, options);

		const products = result.docs.map((doc) => doc.toObject());

		const response = {
			status: "success",
			payload: products,
			totalPages: result.totalPages,
			prevPage: result.prevPage,
			nextPage: result.nextPage,
			page: result.page,
			hasPrevPage: result.hasPrevPage,
			hasNextPage: result.hasNextPage,
			prevLink: result.hasPrevPage
				? `${req.baseUrl}?page=${result.prevPage}`
				: null,
			nextLink: result.hasNextPage
				? `${req.baseUrl}?page=${result.nextPage}`
				: null,
		};

		res.render("products", {
			products: response.payload,
			pageInfo: response,
			user: req.session.user,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send("Error getting products from the database.");
	}
});

router.get("/:pid", async (req, res) => {
	try {
		const pid = req.params.pid;
		const product = await productManager.getById(pid);

		if (product) {
			res.send(product);
		} else {
			res.status(404).send(`The product with id: ${pid} was not found.`);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Error getting product from the database.");
	}
});

router.post("/", async (req, res) => {
	try {
		const product = req.body;
		const result = await productManager.createProduct(product);

		if (typeof result == "string") {
			res.status(400).send({ status: "error", message: result });
		} else {
			res.send({ status: "success" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.put("/:pid", async (req, res) => {
	try {
		const pid = req.params.pid;
		const productUpdate = req.body;

		const result = await productManager.updateProduct(pid, productUpdate);

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

router.delete("/:pid", async (req, res) => {
	try {
		const pid = req.params.pid;
		const result = await productManager.deleteProduct(pid);

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
