import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import viewsRoute from "./routes/views.js";
import sessionsRouter from "./routes/sessions.js";
import { Server } from "socket.io";

import productsRouter from "./routes/products.js";
import cartsRouter from "./routes/carts.js";
import realTimeProductsRoute from "./routes/realTimeProducts.js";
import ProductManager from "./dao/dbFileSystem/ProductManager.js";
import path from "path";
import { productsModel } from "./dao/models/products.js";
import { messagesModel } from "./dao/models/messages.js";

async function connectToDb() {
	try {
		console.log("Connecting to MongoDB ...");
		await mongoose.connect(
			"mongodb+srv://CoderUser:Ag9W4iSW7LWPNtsZ@cluster0.hwubstf.mongodb.net/ecommerce",
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}
		);
		console.log("Connected to MongoDB");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
}

const app = express();

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(
	"/sweetalert2",
	express.static(
		path.join(__dirname, "..", "node_modules", "sweetalert2", "dist")
	)
);

app.use((req, res, next) => {
	next();
});

(async () => {
	await connectToDb();

	const port = 8080;
	const server = app.listen(port, () => {
		console.log(`Server active on port: ${port}`);
	});

	const socketServer = new Server(server);

	const productsPath = path.join(__dirname, "..", "src", "productos.json");

	const productManager = new ProductManager(productsPath, socketServer);

	app.use(
		session({
			store: MongoStore.create({
				mongoUrl:
					"mongodb+srv://CoderUser:Ag9W4iSW7LWPNtsZ@cluster0.hwubstf.mongodb.net/ecommerce",
				ttl: 3600,
			}),
			secret: "CoderSecret",
			resave: false,
			saveUninitialized: false,
		})
	);

	app.use("/", viewsRoute);
	app.use("/api/sessions", sessionsRouter);
	app.use(
		"/realtimeproducts",
		realTimeProductsRoute({ socketServer, productManager })
	);

	app.use("/api/products", productsRouter);
	app.use("/api/carts", cartsRouter);

	app.use((err, req, res, next) => {
		console.error(err);
		res.status(500).send("Something went wrong on app.js");
	});

	const messages = [];
	socketServer.on("connection", async (socket) => {
		console.log("Nuevo cliente conectado");

		try {
			const priorMessages = await messagesModel.find();
			socket.emit("messageLogs", priorMessages);
		} catch (error) {
			console.error("Error fetching messages from DB", error);
		}

		socket.on("message", async (data) => {
			try {
				let userRecord = await messagesModel.findOne({ user: data.user });

				if (userRecord) {
					userRecord.messages.push(data.message);
					await userRecord.save();
				} else {
					const newUserMessage = new messagesModel({
						user: data.user,
						messages: [data.message],
					});
					await newUserMessage.save();
				}

				const allMessages = await messagesModel.find();
				socketServer.emit("messageLogs", allMessages);
			} catch (error) {
				console.error("Error processing message", error);
			}
		});

		socket.on("authenticated", (data) => {
			socket.broadcast.emit("newUserConnected", data);
		});

		socket.on("deleteProduct", async (productId) => {
			try {
				const result = await productsModel.deleteOne({ _id: productId });

				if (result.deletedCount > 0) {
					const updatedProducts = await productsModel.find();
					socketServer.emit("productUpdate", updatedProducts);
				}
			} catch (error) {
				console.error("Error deleting product", error);
			}
		});

		socket.on("addProduct", async (productData) => {
			try {
				const newProduct = new productsModel(productData);
				await newProduct.save();

				const updatedProducts = await productsModel.find();
				socketServer.emit("productUpdate", updatedProducts);
			} catch (error) {
				console.error("Error adding product", error);
			}
		});
	});
})();
