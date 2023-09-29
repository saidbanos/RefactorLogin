import mongoose from "mongoose";

const messagesCollection = "messages";

const messagesSchema = new mongoose.Schema({
	id: {
		type: String,
	},
	user: {
		type: String,
		unique: true,
	},
	messages: [
		{
			type: String,
		},
	],
});

export const messagesModel = mongoose.model(messagesCollection, messagesSchema);
