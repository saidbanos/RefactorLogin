import fs from "fs";

class CartManager {
	constructor(path) {
		this.path = path;
		this.loadCarts();
	}

	async loadCarts() {
		if (fs.existsSync(this.path)) {
			const cartsData = await fs.promises.readFile(this.path, "utf-8");
			this.carts = cartsData ? JSON.parse(cartsData) : [];
		} else {
			this.carts = [];
		}
	}

	addCart = async () => {
		const newCart = {
			id: Date.now(),
			products: [],
		};

		this.carts.push(newCart);
		await fs.promises.writeFile(this.path, JSON.stringify(this.carts));
		return newCart;
	};

	getCartById = async (cid) => {
		const cart = this.carts.find((cart) => cart.id == cid);
		return cart || null;
	};

	addProductToCart = async (cid, pid) => {
		const cart = this.carts.find((cart) => cart.id == cid);
		if (!cart) {
			return { status: "error", message: `Cart with id ${cid} not found` };
		}

		const productInCart = cart.products.find(
			(product) => product.product == pid
		);
		if (productInCart) {
			productInCart.quantity += 1;
		} else {
			cart.products.push({
				product: pid,
				quantity: 1,
			});
		}

		await fs.promises.writeFile(this.path, JSON.stringify(this.carts));
		return {
			status: "success",
			message: "Product added to cart successfully!",
		};
	};
}

export default CartManager;
