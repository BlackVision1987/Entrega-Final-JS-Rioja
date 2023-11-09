document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById("product-list");
    const cart = document.getElementById("cart");
    const totalPrice = document.getElementById("total-price");
    const clearCartButton = document.getElementById("clear-cart");
    const checkoutButton = document.getElementById("checkout");
    let cartItems = [];
    let productData = [];
    checkoutButton.addEventListener("click", checkout);
    const categoryFilter = document.getElementById("category-filter");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    
    const cartIcon = document.getElementById("cart-icon");
    cartIcon.addEventListener("click", showCartSummary);

    function showCartSummary() {
        if (cartItems.length === 0) {
            Swal.fire({
                title: "Carrito de Compras",
                text: "El carrito está vacío.",
                icon: "info",
                confirmButtonText: "Aceptar"
            });
        } else {
            let summary = "Carrito de Compras:<br>";
    
            cartItems.forEach((item) => {
                summary += `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}<br>`;
            });
    
            summary += `<br>Total: $${calculateTotal()}`;
    
            Swal.fire({
                title: "Resumen del Carrito",
                html: summary,
                icon: "info",
                confirmButtonText: "Aceptar"
            });
        }
    }

    function calculateTotal() {
        let total = 0;
        cartItems.forEach((item) => {
            total += item.price * item.quantity;
        });
        return total.toFixed(2);
    }


    // Agrega un evento para restablecer la lista de productos
    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => {
        searchInput.value = ""; // Limpia el campo de búsqueda
        displayProducts(productData); // Muestra la lista completa de productos
    });

    searchButton.addEventListener("click", performSearch);

    function performSearch() {
        const query = searchInput.value.toLowerCase(); // Obtén la consulta y conviértela a minúsculas
    
        // Filtra los productos que coinciden con la consulta
        const searchResults = productData.filter((product) => product.name.toLowerCase().includes(query));
    
        // Muestra los resultados en la página
        displayProducts(searchResults);
    }

    
    categoryFilter.addEventListener("change", function () {
        const selectedCategory = categoryFilter.value;
        const filteredProducts = selectedCategory === "all" ? productData : filterProductsByCategory(productData, selectedCategory);
        displayProducts(filteredProducts);
    });

    // Función para mostrar los productos en la página
    function displayProducts(products) {
        const productContainer = document.getElementById("product-list");
        productContainer.innerHTML = "";

        products.forEach((product) => {
            const productDiv = document.createElement("div");
            productDiv.className = "product-item";
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Agregar al carrito</button>
                <div class="quantity-controls">
                    <button class="increase-quantity" data-id="${product.id}">+</button>
                    <span class="product-quantity" data-id="${product.id}">1</span>
                    <button class="decrease-quantity" data-id="${product.id}">-</button>
                </div>
            `;

            const addToCartButton = productDiv.querySelector(".add-to-cart");
            const increaseQuantityButton = productDiv.querySelector(".increase-quantity");
            const decreaseQuantityButton = productDiv.querySelector(".decrease-quantity");
            const productQuantity = productDiv.querySelector(".product-quantity");

            addToCartButton.addEventListener("click", () => addToCart(product.id, productQuantity));
            increaseQuantityButton.addEventListener("click", () => increaseQuantity(product.id, productQuantity));
            decreaseQuantityButton.addEventListener("click", () => decreaseQuantity(product.id, productQuantity));

            productContainer.appendChild(productDiv);
        });
    }

    // Función para aumentar la cantidad de un producto en el carrito
    function increaseQuantity(productId, quantityElement) {
        const cartItem = cartItems.find((item) => item.id === productId);
        if (cartItem) {
            cartItem.quantity++;
            if (quantityElement) {
                quantityElement.textContent = cartItem.quantity;
            }
            updateCart();
        }
    }

    // Función para disminuir la cantidad de un producto en el carrito
    function decreaseQuantity(productId, quantityElement) {
        const cartItem = cartItems.find((item) => item.id === productId);
        if (cartItem && cartItem.quantity > 1) {
            cartItem.quantity--;
            if (quantityElement) {
                quantityElement.textContent = cartItem.quantity;
            }
            updateCart();
        }
    }
    
    // Función para filtrar productos por categoría
    function filterProductsByCategory(products, category) {
        return products.filter((product) => product.category === category);
    }

    // Cargar productos desde el archivo JSON
    fetch("products.json")
        .then((response) => response.json())
        .then((data) => {
            productData = data;
            displayProducts(productData);
        })
        .catch((error) => {
            console.error("Error al cargar productos: " + error);
        });

    // Función para agregar productos al carrito
    function addToCart(productId, quantityElement) {
        const product = getProductById(productId);
    
        if (product) {
            let cartItem = cartItems.find((item) => item.id === productId);
            if (!cartItem) {
                cartItem = { ...product, quantity: 0 };
                cartItems.push(cartItem);
            }
            
            cartItem.quantity++;
            
            if (quantityElement) {
                quantityElement.textContent = cartItem.quantity;
            }
            updateCart();
        }
    }
    // Función para obtener un producto por su ID
    function getProductById(id) {
        return productData.find((product) => product.id === id);
    }

    // Función para actualizar el carrito
    function updateCart() {
        cart.innerHTML = '';
        let total = 0;

        cartItems.forEach((item) => {
            total += item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-from-cart" data-id="${item.id}">Eliminar</button>
            `;

            cart.appendChild(cartItem);
        });

        totalPrice.textContent = total.toFixed(2);

        // Agregar evento para eliminar productos del carrito
        const removeButtons = document.querySelectorAll('.remove-from-cart');
        removeButtons.forEach((button) => {
            button.addEventListener('click', removeFromCart);
        });
    }

    // Función para eliminar productos del carrito
    function removeFromCart(event) {
        const productId = parseInt(event.target.getAttribute('data-id'));
        const itemIndex = cartItems.findIndex((item) => item.id === productId);

        if (itemIndex !== -1) {
            if (cartItems[itemIndex].quantity > 1) {
                cartItems[itemIndex].quantity--;
            } else {
                cartItems.splice(itemIndex, 1);
            }

            updateCart();
        }
    }

    // Botón para vaciar el carrito
    clearCartButton.addEventListener('click', () => {
        cartItems = [];
        updateCart();
    });

    // Función para la compra
    function checkout() {        
        Swal.fire({
            title: "¡Gracias por tu compra!",
            text: "Tu pedido ha sido registrado.",
            icon: "success",
            confirmButtonText: "Aceptar"
        });
    }

    
});
