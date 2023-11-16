document.addEventListener("DOMContentLoaded", function () {
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
    const cartCount = document.getElementById("cart-count");
    const cartIcon = document.getElementById("cart-icon");
    cartIcon.addEventListener("click", showCartSummary);

    function updateCartCount() {
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        cartCount.textContent = totalItems.toString();
    }

    function showCartSummary() {
        if (cartItems.length === 0) {
            showCartAlert("El carrito está vacío.", true);
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
        searchInput.value = "";
        displayProducts(productData);
    });

    searchButton.addEventListener("click", performSearch);

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        
        const searchResults = productData.filter((product) => product.name.toLowerCase().includes(query));
        
        displayProducts(searchResults);
    }

    categoryFilter.addEventListener("change", function () {
        const selectedCategory = categoryFilter.value;
        const filteredProducts = selectedCategory === "all" ? productData : filterProductsByCategory(productData, selectedCategory);
        displayProducts(filteredProducts);
    });

    function Product(id, name, price, image, category, specifications) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
        this.specifications = specifications;
    }

    function displayProducts(products) {
        const productContainer = document.getElementById("product-list");
        productContainer.innerHTML = "";
    
        products.forEach((product) => {
            const productDiv = document.createElement("div");
            productDiv.className = "product-item";
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" data-id="${product.id}">
                <h3 class="product-title" data-id="${product.id}">${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Agregar al carrito</button>
                <div class="quantity-controls">
                    <button class="increase-quantity" data-id="${product.id}">+</button>
                    <span class="product-quantity" data-id="${product.id}">0</span>
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
    
            const productImage = productDiv.querySelector(".product-image");
            const productTitle = productDiv.querySelector(".product-title");
    
            productImage.addEventListener("click", () => showProductDetails(product));
            productTitle.addEventListener("click", () => showProductDetails(product));
    
            productContainer.appendChild(productDiv);
        });
    }

    let specificationsModal;

    function showProductDetails(product) {        
        if (specificationsModal) {
            specificationsModal.style.display = "none";
        }
    
        const specificationsText = document.createElement("div");
        specificationsText.textContent = product.specifications;
    
        const closeButton = document.createElement("button");
        closeButton.textContent = "Cerrar";
        closeButton.addEventListener("click", () => {
            specificationsModal.style.display = "none";
        });
    
        specificationsModal = document.createElement("div");
        specificationsModal.className = "specifications-modal";
        specificationsModal.appendChild(specificationsText);
        specificationsModal.appendChild(closeButton);
    
        document.body.appendChild(specificationsModal);
        specificationsModal.style.display = "block";
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
            showCartAlert("Cantidad incrementada");
        } else {
            
            addToCart(productId, quantityElement);
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
            showCartAlert("Cantidad disminuida");
        } else if (cartItem && cartItem.quantity === 1) {            
            removeFromCart(productId);
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
            productData = data.map((product) => new Product(product.id, product.name, product.price, product.image, product.category, product.specifications));
            displayProducts(productData);
        })
        .catch((error) => {
            console.error("Error al cargar productos: " + error);
        });

    // Función para agregar productos al carrito
    function addToCart(productId, quantityElement) {
        const product = getProductById(productId);
    
        if (!product) {
            console.error(`Producto con ID ${productId} no encontrado.`);
            return;
        }
    
        let cartItem = cartItems.find((item) => item.id === productId);
    
        if (!cartItem) {
            cartItem = { ...product, quantity: 0 };
            cartItems.push(cartItem);
        }
    
        cartItem.quantity++;
    
        if (quantityElement) {
            quantityElement.textContent = cartItem.quantity;
        }
    
        showCartAlert("Producto agregado al carrito");
        updateCart();
        updateCartCount();
    }

    // Función para obtener un producto por su ID
    function getProductById(id) {
        return productData.find((product) => product.id === id);
    }

    // Función para actualizar el carrito
    function updateCart() {
        cart.innerHTML = "";
        let total = 0;
    
        cartItems.forEach((item) => {
            total += item.price * item.quantity;
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
    
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-from-cart" data-id="${item.id}">Eliminar</button>
            `;
    
            cart.appendChild(cartItem);
        });
    
        totalPrice.textContent = total.toFixed(2);
        updateCartCount();
        addRemoveFromCartListeners();
    }
    
    function updateCartCount() {
        const totalCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalCount.toString();
    }

    function addRemoveFromCartListeners() {
        const removeButtons = document.querySelectorAll(".remove-from-cart");
        removeButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                const productId = parseInt(event.target.getAttribute("data-id"));
                removeFromCart(productId);
            });
        });
    }

    // Función para eliminar productos del carrito
    function removeFromCart(productId) {
        const itemIndex = cartItems.findIndex((item) => item.id === productId);

        if (itemIndex !== -1) {
            if (cartItems[itemIndex].quantity > 1) {
                cartItems[itemIndex].quantity--;
            } else {
                cartItems.splice(itemIndex, 1);
            }

            updateCart();
            updateProductQuantity(productId);
            showCartAlert("Producto eliminado del carrito");
        } else {            
            console.error(`Producto con ID ${productId} no encontrado en el carrito.`);
        }
    }

    // Función para actualizar la cantidad entre "+" y "-"
    function updateProductQuantity(productId) {
        const productQuantityElement = document.querySelector(`.product-quantity[data-id="${productId}"]`);
        if (productQuantityElement) {
            const cartItem = cartItems.find((item) => item.id === productId);
            productQuantityElement.textContent = cartItem ? cartItem.quantity : '0';
        }
    }

    // Botón para vaciar el carrito
    clearCartButton.addEventListener("click", () => {
        cartItems = [];
        updateCart();        
        showCartAlert("Carrito vaciado");
    });

    // Función para la compra
    function checkout() {
        const total = calculateTotal();
        Swal.fire({
            title: "¡Gracias por tu compra!",
            html: `Tu pedido ha sido registrado.<br>Total: $${total}`,
            icon: "success",
            confirmButtonText: "Aceptar"
        });
        
        cartItems = [];
        updateCart();
        updateCartCount();        
    }

    // Función para mostrar alerta de carrito con SweetAlert
    function showCartAlert(message, isEmpty = false) {
        const icon = isEmpty ? "info" : "success";

        Swal.fire({
            title: "Carrito de Compras",
            text: message,
            icon: icon,
            showConfirmButton: false,
            timer: 1000
        });
    }

    // Función para actualizar el contador del carrito
    function updateCartCount() {
        const cartCount = document.getElementById("cart-count");
        const totalCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalCount.toString();
    }
});
