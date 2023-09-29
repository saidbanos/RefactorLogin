document.addEventListener("DOMContentLoaded", () => {
	const cartIdInput = document.getElementById("cartIdInput");
	const errorMessage = document.getElementById("errorMessage");
	const goToCartBtn = document.getElementById("goToCartBtn");

	goToCartBtn.addEventListener("click", async () => {
		const cartId = cartIdInput.value;

		if (!cartId || cartId === "") {
			errorMessage.innerText = "Please enter a Cart ID.";
			errorMessage.style.display = "block";
			setTimeout(() => {
				errorMessage.style.display = "none";
			}, 3000);
			return;
		}

		errorMessage.style.display = "none";

		if (!/^[0-9a-fA-F]{24}$/.test(cartId)) {
			errorMessage.innerText = "Invalid Cart ID.";
			errorMessage.style.display = "block";
			setTimeout(() => {
				errorMessage.style.display = "none";
			}, 3000);
			return;
		}

		try {
			const response = await fetch(`/api/carts/${cartId}`);
			const data = await response.json();

			if (response.status !== 200) {
				throw new Error(data.error || "Cart not found.");
			}

			window.location.href = `/carts/${cartId}`;
		} catch (error) {
			console.error("Error:", error.message);
			errorMessage.innerText = "Cart not found.";
			errorMessage.style.display = "block";
			setTimeout(() => {
				errorMessage.style.display = "none";
			}, 3000);
		}
	});

	document.addEventListener("click", async function (e) {
		if (e.target && e.target.className === "addToCartBtn") {
			const productId = e.target.getAttribute("data-product-id");
			const cartId = cartIdInput.value;

			if (!cartId || cartId == "") {
				errorMessage.innerText = "Please enter a Cart ID.";
				errorMessage.style.display = "block";
				setTimeout(() => {
					errorMessage.style.display = "none";
				}, 3000);
				return;
			}

			errorMessage.style.display = "none";

			if (!/^[0-9a-fA-F]{24}$/.test(cartId)) {
				errorMessage.innerText = "Invalid Cart ID.";
				errorMessage.style.display = "block";
				setTimeout(() => {
					errorMessage.style.display = "none";
				}, 3000);
				return;
			}

			try {
				const response = await fetch(
					`/api/carts/${cartId}/product/${productId}`,
					{
						method: "POST",
					}
				);

				const data = await response.json();

				if (response.status !== 200) {
					throw new Error(data.error || "Error adding product to cart.");
				}

				const productIndex = e.target.getAttribute("data-product-index");
				const successMessage = document.querySelector(
					`.successMessage[data-product-index="${productIndex}"]`
				);
				successMessage.innerText = "Product added to the cart successfully!";
				successMessage.style.display = "block";

				setTimeout(() => {
					successMessage.style.display = "none";
				}, 3000);
			} catch (error) {
				console.error("Error:", error.message);
			}
		}
	});
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/sessions/logout');
        const data = await response.json();
        
        if (response.status === 200 && (data.status === "success" || data.status === "info")) {
            window.location.replace('/login'); // Redirect to login page
        } else {
            alert(data.message || 'Failed to log out.'); // Alert any error message or a default message
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});