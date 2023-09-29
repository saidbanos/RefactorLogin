import { productsModel } from "../models/products.js";

export default class ProductManager {
	constructor() {}

	getAll = async (limit) => {
		let products = await productsModel.find();
		products = products.map((product) => product.toObject());

		if (limit && !isNaN(limit) && limit > 0) {
			products = products.slice(0, Number(limit));
		}

		return products;
	};

	getById = async (id) => {
		const product = await productsModel.findOne({ _id: id });
		if (product) {
			return product.toObject();
		}
		return null;
	};

	createProduct = async (productData) => {
		try {
			const newProduct = new productsModel(productData);
			const result = await newProduct.save();
			return result;
		} catch (error) {
			throw error;
		}
	};

	updateProduct = async (id, productUpdate) => {
		try {
			const result = await productsModel.updateOne({ _id: id }, productUpdate);
			if (result.nModified === 0) {
				return {
					error: `Product with id ${id} not updated. It may not exist or no changes were made.`,
				};
			}
			const updatedProduct = await this.getById(id);
			return updatedProduct;
		} catch (error) {
			throw error;
		}
	};

	deleteProduct = async (id) => {
		try {
			const result = await productsModel.deleteOne({ _id: id });
			if (result.deletedCount === 0) {
				return {
					error: `Product with id ${id} not found and therefore not deleted.`,
				};
			}
			return { success: `Product with id ${id} was deleted successfully.` };
		} catch (error) {
			throw error;
		}
	};
}
