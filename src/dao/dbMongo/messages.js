import { messagesModel } from "../models/messages.js";

export default class MessageManager {
	constructor() {}

	getAllMessages = async () => {
		const chatDocs = await messagesModel.find();
		return chatDocs.map((doc) => doc.toObject());
	};
}
