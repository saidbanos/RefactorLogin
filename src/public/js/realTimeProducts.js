const socketConnection = io();

socketConnection.on("productUpdate", (updatedProducts) => {
	const productList = document.getElementById("product-list");
	productList.innerHTML = "";

	updatedProducts.forEach((product) => {
		const productItem = document.createElement("li");

		let thumbnailsList = "";
		product.thumbnails.forEach((thumbnail) => {
			thumbnailsList += `<li><img src="${thumbnail}" alt="${product.title} thumbnail" style="width: 50px;"></li>`;
		});

		productItem.innerHTML = `
            <strong>Title:</strong> ${product.title}<br>
            <strong>ID:</strong> ${product._id}<br>
            <strong>Description:</strong> ${product.description}<br>
            <strong>Price:</strong> $${product.price}<br>
            <strong>Code:</strong> ${product.code}<br>
            <strong>Stock:</strong> ${product.stock}<br>
            <strong>Status:</strong> ${product.status}<br>
            <strong>Category:</strong> ${product.category}<br>
            <strong>Thumbnails:</strong>
            <ul>
                ${thumbnailsList}
            </ul>
        `;
		productList.appendChild(productItem);
	});
});

document
	.getElementById("delete-product-form")
	.addEventListener("submit", function (e) {
		e.preventDefault();
		const productId = e.target["product-id"].value;
		console.log("Deleting product with ID:", productId);
		socketConnection.emit("deleteProduct", productId);
		e.target.reset();
	});

document
	.getElementById("add-product-form")
	.addEventListener("submit", function (e) {
		e.preventDefault();
		const productData = {
			title: e.target.title.value,
			price: parseFloat(e.target.price.value),
			code: e.target.code.value,
			description: e.target.description.value,
			stock: e.target.stock.value,
			status: e.target.status.checked,
			category: e.target.category.value,
			thumbnails: e.target.thumbnails.value.split(","),
		};

		socketConnection.emit("addProduct", productData);
		e.target.reset();
	});
