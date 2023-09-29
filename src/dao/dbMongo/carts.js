import { cartsModel } from "../models/carts.js";
import { productsModel } from "../models/products.js";

export default class CartManager {
	constructor() {}

	getCartById = async (cid) => {
		return await cartsModel.findOne({ _id: cid }).populate("products.product");
	};

	createNewCart = async () => {
		const newCart = new cartsModel();
		return await newCart.save();
	};

	addProductToCart = async (cid, pid) => {
		const product = await productsModel.findOne({ _id: pid });
		const cart = await cartsModel.findOne({ _id: cid });

		if (!product) {
			return { error: `Product with id ${pid} not found` };
		}

		if (!cart) {
			return { error: `Cart with id ${cid} not found` };
		}

		let existingProductInCart = cart.products.find(
			(p) => p.product.toString() === pid
		);

		if (existingProductInCart) {
			existingProductInCart.quantity += 1;
		} else {
			cart.products.push({
				product: pid,
				quantity: 1,
			});
		}
		const updatedCart = await cartsModel
			.findOneAndUpdate({ _id: cid }, cart, { new: true })
			.populate("products.product");

		return updatedCart;
	};

	removeProductFromCart = async (cid, pid) => {
		const cart = await this.getCartById(cid);
		if (!cart) {
			return { error: `Cart with id ${cid} not found` };
		}

		const productIndex = cart.products.findIndex(
			(p) => p.product.toString() === pid
		);

		if (productIndex === -1) {
			return { error: `Product with id ${pid} not found in cart` };
		}

		await cartsModel.updateOne(
			{ _id: cid },
			{ $pull: { products: { product: pid } } }
		);

		const updatedCart = await this.getCartById(cid);
		return updatedCart;
	};

	updateCartProducts = async (cid, productsToUpdate) => {
		try {
			const cart = await cartsModel
				.findOne({ _id: cid })
				.populate("products.product");
			if (!cart) {
				throw new Error(`Cart with ID ${cid} not found.`);
			}

			const updatedProducts = [];

			for (let p of productsToUpdate) {
				const product = await productsModel.findOne({ _id: p.id });

				if (!product) {
					throw new Error(`Product with ID ${p.id} not found.`);
				}

				updatedProducts.push({
					product: p.id,
					quantity: p.quantity,
				});
			}

			cart.products = updatedProducts;
			cart.markModified("products");
			await cart.save();

			return await this.getCartById(cid);
		} catch (error) {
			console.error("Error in updateCartProducts:", error);
			throw error;
		}
	};

	updateProductQuantity = async (cid, pid, quantity) => {
		const cart = await this.getCartById(cid);
		if (!cart) {
			return { error: `Cart with id ${cid} not found` };
		}

		const productInCart = cart.products.find(
			(p) => p.product._id.toString() === pid
		);

		if (!productInCart) {
			return { error: `Product with id ${pid} not found in cart` };
		}

		productInCart.quantity = quantity;
		await cartsModel.updateOne({ _id: cid }, cart);
		return await this.getCartById(cid);
	};

	removeAllProductsFromCart = async (cid) => {
		const cart = await this.getCartById(cid);
		if (!cart) {
			return { error: `Cart with id ${cid} not found` };
		}

		const result = await cartsModel.updateOne(
			{ _id: cid },
			{ $set: { products: [] } }
		);
		return await this.getCartById(cid);
	};
}
