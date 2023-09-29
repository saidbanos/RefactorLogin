import { Router } from "express";

import ProductManager from "../dao/dbFileSystem/ProductManager.js";
import path from "path";
import __dirname from "../utils.js";
import { productsModel } from "../dao/models/products.js";

const router = Router();

const productsPath = path.join(__dirname, "..", "src", "productos.json");

const productManager = new ProductManager(productsPath);

const publicAccess = (req, res, next) => {
    if (req.session.user) return res.redirect('/profile');
    next();
}

const privateAccess = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

router.get("/", publicAccess, (req, res) => {
    res.render('login');
});

router.get("/products", privateAccess, async (req, res) => {
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

		res.render("index", { products: response.payload, pageInfo: response, user: req.session.user });
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.get("/carts/:cid", async (req, res) => {
	try {
		const cid = req.params.cid;

		const cartResponse = await fetch(`http://localhost:8080/api/carts/${cid}`);

		if (!cartResponse.ok) {
			throw new Error(`Cart with id ${cid} not found`);
		}

		const cartData = await cartResponse.json();

		res.render("cart", { cartData });
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal server error");
	}
});

router.get('/login', publicAccess, (req, res)=> {
    res.render('login');
})

router.get('/register', publicAccess, (req, res)=> {
    res.render('register')
})

router.get('/profile', privateAccess, (req, res)=> {
    res.render('profile', {
        user: req.session.user,
    })
})

export default router;
