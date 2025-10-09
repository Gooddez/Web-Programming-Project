function showDetail(id, name, price) {
    const detail = document.getElementById(`detail-container-${id}`);
    const form = document.getElementById(`customize-form-${id}`);

    if (!form.innerHTML) {
        const endpoint = "http://localhost:3000/api/detail";
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
                    const isCheckbox = group.values.some(
                        (v) => [3,4].includes(v.option_id)
                    ); 
                    const inputType = isCheckbox ? "checkbox" : "radio";

                    formHTML += `<div class="option-div"><h3>${group.name}</h3>`;
                    group.values.forEach((item) => {
                        formHTML += `
                            <div class='select-option'>
                                <input ${[3,4].includes(item.option_id) ? "" : "required"} type="${inputType}" id="value-${item.value_id}" name="${item.option_id}" value='{"name":"${item.value_name}", "price":${item.extra_price}}'>
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
                    form.innerHTML += `<p>ไม่มีรายการให้ปรับแต่ง</p>`
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
                    formContainer.appendChild(submitButton)
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
                    newPrice.value = totalPrice
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
    form.innerHTML = ''
};


// CART :DD
function showCart() {
    const cartIcon = document.getElementById('cart')
    const cart = document.getElementById("cart-container");
    cart.innerHTML = ''

    if (!cart.innerHTML) {
        cart.innerHTML += `<button class="close-cart-button" onclick="closeCart()">X</button><h1>ตะกร้าสินค้า</h1><div class="cart-item-container" id="cart-item-container"></div>`
        const cartItemContainer = document.getElementById("cart-item-container")
        const endpoint = "http://localhost:3000/api/get-cart";
        const sendPackage = {
            method: "POST",
            headers: { "Content-Type": "application/json" } 
        };

        fetch(endpoint, sendPackage)
            .then((response) => response.json())
            .then((items) => {
                if (!(items.length === 0)){
                    let finalPrice = 0
                    items.forEach(item => {
                        let itemCreate = ''
                        itemCreate += `<div class="cart-item">
                                        <p class="menu-name">รายการ : ${item.menu_name} x${1}</p>
                                        <p style="margin-left: 7px;">รายละเอียดตัวเลือก : `
                        if (!(item.options.length === 0)) {
                            item.options.forEach(value => {
                                itemCreate += `${value.name} `
                            })
                        } else {
                            itemCreate += `-`
                        }
                        itemCreate += `</p><p>ราคา : ${item.totalPrice} บาท</p></div>`
                        cartItemContainer.innerHTML += itemCreate
                        finalPrice += parseInt(item.totalPrice)
                    })
                    const html = `<div class="total-price-container">
                        <p>ราคารวม : ${finalPrice} บาท</p>
                        <a href="/payment"><div class="payment-button">ชำระเงิน</div></a>
                    </div>`
                    cart.innerHTML += html
                } else {
                    let itemCreate = `<p>ไม่มีรายการสินค้า</p>`
                    cartItemContainer.innerHTML += itemCreate
                }
                
            })
            .catch((err) => console.error("Error fetching details:", err));
    } 
    cart.style.display = "flex";
};

const closeCart = () => {
    const cart = document.getElementById("cart-container");
    cart.style.display = "none";
};
