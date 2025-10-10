function showDetail(id, name, price) {
    const detail = document.getElementById(`detail-container-${id}`);
    const form = document.getElementById(`customize-form-${id}`);

    if (!form.innerHTML) {
        // const endpoint = "http://localhost:3000/api/detail";
        const endpoint = `${window.location.origin}/api/detail`;
        const sendPackage = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menuID: id }),
        };
        fetch(endpoint, sendPackage)
            .then((response) => response.json())
            .then((options) => {
                const optionGroups = options.reduce((groups, item) => {
                    const key = item.option_id;
                    if (!groups[key]) {
                        groups[key] = {
                            name: item.option_name,
                            values: [],
                        };
                    }
                    groups[key].values.push(item);
                    return groups;
                }, {});

                let formHTML = `<input type="hidden" name="menu_id" value="${id}"><input type="hidden" name="menu_name" value="${name}"><input type="hidden" id="totalPrice" name="totalPrice" value="${price}">`;
                for (const optionId in optionGroups) {
                    const group = optionGroups[optionId];
                    const isCheckbox = group.values.some((v) =>
                        [3, 4].includes(v.option_id)
                    );
                    const inputType = isCheckbox ? "checkbox" : "radio";

                    formHTML += `<div class="option-div"><h3>${group.name}</h3>`;
                    group.values.forEach((item) => {
                        formHTML += `
                            <div class='select-option'>
                                <input ${
                                    [3, 4].includes(item.option_id)
                                        ? ""
                                        : "required"
                                } type="${inputType}" id="value-${
                            item.value_id
                        }" name="${item.option_id}" value='{"name":"${
                            item.value_name
                        }", "price":${item.extra_price}}'>
                                <label for="value-${item.value_id}">
                                    <span>${item.value_name}</span>
                                    <span>+${item.extra_price} THB</span>
                                </label>
                            </div>`;
                    });
                    formHTML += `</div>`;
                }
                form.innerHTML = formHTML;
                if (options.length === 0) {
                    form.innerHTML += `<p>ไม่มีรายการให้ปรับแต่ง</p>`;
                }

                const formContainer = document.getElementById(
                    `form-container-${id}`
                );
                if (!formContainer.querySelector(".add-to-cart-button")) {
                    const submitButton = document.createElement("button");
                    submitButton.type = "submit";
                    submitButton.setAttribute("form", `customize-form-${id}`);
                    submitButton.textContent = "เพิ่มลงตะกร้า";
                    submitButton.className = "add-to-cart-button";
                    formContainer.appendChild(submitButton);
                }

                form.addEventListener("change", () => {
                    const priceContainer = document.getElementById(
                        `price-${id}`
                    );
                    const newPrice = document.getElementById(`totalPrice`);

                    const basePrice = parseInt(
                        priceContainer.dataset.normalprice,
                        10
                    );
                    let totalPrice = basePrice;

                    const checkedInputs =
                        form.querySelectorAll("input:checked");
                    checkedInputs.forEach((input) => {
                        const value = JSON.parse(input.value);
                        totalPrice += value.price;
                    });

                    priceContainer.innerText = `Price: ${totalPrice} THB`;
                    newPrice.value = totalPrice;
                });
                detail.addEventListener("click", (event) => {
                    console.log(event.target)
                    // if clicked outside the popup content
                    if (!event.target.closest(".detail-container")) {
                        detail.style.display = "none";
                    }
                });
            })
            .catch((err) => console.error("Error fetching details:", err));
    }
    detail.style.display = "flex";
}

const closeDetail = (id) => {
    const form = document.getElementById(`customize-form-${id}`);
    const detail = document.getElementById(`detail-container-${id}`);
    detail.style.display = "none";
    form.innerHTML = "";
};

// CART :DD
function showCart() {
    const cartContainer = document.getElementById("cart-container");
    cartContainer.innerHTML = ""; // Clear previous content

    const endpoint = `${window.location.origin}/api/get-cart`;
    fetch(endpoint, { method: "POST" })
        .then((response) => response.json())
        .then((items) => {
            let cartHTML = `<button class="close-cart-button" onclick="closeCart()">X</button><h1>ตะกร้าสินค้า</h1><div class="cart-item-container" id="cart-item-container"></div>`;
            cartContainer.innerHTML = cartHTML;
            
            const cartItemContainer = document.getElementById("cart-item-container");
            let finalPrice = 0;

            if (items.length === 0) {
                cartItemContainer.innerHTML = "<p>ไม่มีรายการสินค้า</p>";
            } else {
                items.forEach((item) => {
                    const itemTotalPrice = item.unitPrice * item.quantity;
                    finalPrice += itemTotalPrice;

                    let optionsHTML = item.options.map(opt => opt.name).join(', ') || '-';

                    // Note the data-item-id attribute on the buttons
                    cartItemContainer.innerHTML += `
                        <div class="cart-item">
                            <p class="menu-name">รายการ : ${item.menu_name}</p>
                            <p style="margin-left: 7px;">รายละเอียดตัวเลือก : ${optionsHTML}</p>
                            <div class="quantity-control">
                                <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                <span class="quantity-text">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                            <p>ราคา : ${itemTotalPrice.toFixed(2)} บาท</p>
                            <button class="remove-item-btn" onclick="removeCartItem('${item.id}')">X</button>
                        </div>`;
                });

                // Add footer with total price and payment button
                cartContainer.innerHTML += `
                    <div class="total-price-container">
                        <p>ราคารวม : ${finalPrice.toFixed(2)} บาท</p>
                        <a href="/payment"><div class="payment-button">ชำระเงิน</div></a>
                    </div>`;
            }
        })
        .catch((err) => console.error("Error fetching cart:", err));

    cartContainer.style.display = "flex";
}

// NEW FUNCTION: Handles clicks on '+' and '-' buttons
function updateCartItemQuantity(itemId, quantity) {
    if (quantity < 1) {
        removeCartItem(itemId); // If quantity drops to 0, remove the item
        return;
    }

    fetch(`${window.location.origin}/api/cart/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showCart(); // Refresh the cart display
        }
    });
}

// NEW FUNCTION: Handles removing an item from the cart
function removeCartItem(itemId) {
    fetch(`${window.location.origin}/api/cart/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showCart(); // Refresh the cart display
        }
    });
}

const closeCart = () => {
    const cart = document.getElementById("cart-container");
    cart.style.display = "none";
};

document.addEventListener("DOMContentLoaded", function () {
    const id = localStorage.getItem("tableID");
    console.log(id);
    const body = document.body;
    body.innerHTML += `<div class="table-id" id="table-id"><p>table : ${id}</p></div>`;
    if (id === "0") {
        const parent = document.getElementById("table-id");
        parent.innerHTML += `<a href="/cashier"><div class="back-to-home-button">กลับหน้าหลัก</div></a>`;
    } else {
        const parent = document.getElementById("table-id");
        parent.innerHTML += `<a href="/orders/${id}"><div class="back-to-home-button">Order</div></a>`;
    }
});
