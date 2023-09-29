import mongoose from "mongoose";
import { productsModel } from "./products.js";

const cartsCollection = "carts";

const cartsSchema = new mongoose.Schema({
	id: {
		type: String,
	},
	products: {
		type: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: productsModel.modelName,
				},
				quantity: Number,
			},
		],
		default: [],
	},
});

export const cartsModel = mongoose.model(cartsCollection, cartsSchema);
