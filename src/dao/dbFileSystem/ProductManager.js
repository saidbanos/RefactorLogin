import fs from "fs";

class ProductManager {
	constructor(path, socketServer = null) {
		this.path = path;
		this.socketServer = socketServer;
		this.loadProducts();
	}

	emitProductsUpdate() {
		if (this.socketServer) {
			this.socketServer.emit("productUpdate", this.products);
		}
	}

	async loadProducts() {
		if (fs.existsSync(this.path)) {
			const productsData = await fs.promises.readFile(this.path, "utf-8");
			this.products = productsData ? JSON.parse(productsData) : [];
		} else {
			this.products = [];
		}
		this.emitProductsUpdate();
	}

	getProducts = async () => {
		if (fs.existsSync(this.path)) {
			const products = await fs.promises.readFile(this.path, "utf-8");
			if (products.length > 0) {
				this.products = JSON.parse(products);
			} else {
				console.log("No products in the file");
			}
		} else {
			console.log("The file does not exist");
		}
		this.emitProductsUpdate();
		return this.products;
	};

	addProduct = async (
		title,
		description,
		price,
		thumbnails,
		code,
		stock,
		category
	) => {
		if (!title || !description || !price || !code || !stock || !category) {
			console.log("All fields, except for thumbnails, are mandatory.");
			return {
				status: "error",
				message: "All fields, except for thumbnails, are mandatory.",
			};
		}

		let allCodes = this.products.map((product) => product.code);

		if (allCodes.includes(code)) {
			const message = `The code: - ${code} - already exists, enter a new code.`;
			console.log(message);
			return { status: "error", message: message };
		}

		if (fs.existsSync(this.path)) {
			const myNewObject = {
				id: Date.now(),
				title: title,
				description: description,
				price: price,
				thumbnails: thumbnails || [],
				code: code,
				stock: stock,
				status: true,
				category: category,
			};

			this.products.push(myNewObject);

			await fs.promises.writeFile(this.path, JSON.stringify(this.products));
		}
		this.emitProductsUpdate();
		console.log("Success. Product added successfully!");
		return { status: "success", message: "Product added successfully!" };
	};

	getProductById = async (id) => {
		if (fs.existsSync(this.path)) {
			const products = JSON.parse(
				await fs.promises.readFile(this.path, "utf-8")
			);

			for (const element of products) {
				if (element.id == id) {
					return element;
				}
			}
		}
		return {};
	};

	updateProduct = async (id, fieldToUpdate) => {
		if (!fs.existsSync(this.path)) {
			return { status: "error", message: "The file does not exist." };
		}

		let products = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
		let product = products.find((product) => product.id == id);

		if (!product) {
			return { status: "error", message: `Product with id ${id} not found` };
		}

		let invalidFields = [];
		for (let key in fieldToUpdate) {
			if (product.hasOwnProperty(key)) {
				product[key] = fieldToUpdate[key];
			} else {
				invalidFields.push(key);
			}
		}

		if (invalidFields.length > 0) {
			return {
				status: "error",
				message: `Invalid field(s) provided: ${invalidFields.join(", ")}`,
			};
		}

		await fs.promises.writeFile(this.path, JSON.stringify(products));
		this.emitProductsUpdate();
		return { status: "success", message: "Product updated successfully!" };
	};

	deleteProduct = async (id) => {
		if (!fs.existsSync(this.path)) {
			return { status: "error", message: "The file does not exist." };
		}

		let products = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));

		const productIndex = products.findIndex((product) => product.id == id);

		if (productIndex == -1) {
			return { status: "error", message: `Product with id ${id} not found` };
		}

		products.splice(productIndex, 1);
		await fs.promises.writeFile(this.path, JSON.stringify(products));
		this.emitProductsUpdate();
		console.log("Success. Product deleted successfully!");
		return { status: "success", message: "Product deleted successfully!" };
	};
}

export default ProductManager;
