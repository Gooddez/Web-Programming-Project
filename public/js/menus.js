function showDetail(id) {
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
                // Group options by their name/id for easier processing
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

                // FIX #3: Build HTML in a string first for performance
                let formHTML = `<input type="hidden" name="menu_id" value="${id}">`;
                for (const optionId in optionGroups) {
                    const group = optionGroups[optionId];
                    const isCheckbox = group.values.some(
                        (v) => v.option_id === 4
                    ); // Example check
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

                // FIX #4: Target the correct, unique container for the button
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

                    // const element = `<button type="submit" class="add-to-cart-button" form="customize-form-${id}">เพิ่มลงตะกร้า</button>`
                    // formContainer.innerHTML += element
                }

                // Add the event listener just once, after creating the form
                form.addEventListener("change", () => {
                    const priceContainer = document.getElementById(
                        `price-${id}`
                    );

                    const basePrice = parseInt(
                        priceContainer.dataset.normalprice,
                        10
                    );
                    let totalPrice = basePrice;

                    const checkedInputs =
                        form.querySelectorAll("input:checked");
                    checkedInputs.forEach((input) => {
                        console.log("Input value:", input.value);
                        const value = JSON.parse(input.value);
                        console.log("Selected value:", value);
                        totalPrice += value.price;
                    });

                    priceContainer.innerText = `Price: ${totalPrice} THB`;
                });
            })
            .catch((err) => console.error("Error fetching details:", err));
    }
    detail.style.display = "flex";
}

const closeDetail = (id) => {
    const detail = document.getElementById(`detail-container-${id}`);
    detail.style.display = "none";
};


// CART :DD
function showCart() {
    const cartIcon = document.getElementById('cart')
    const cart = document.getElementById(`cart-container`);

    if (!cart.innerHTML) {
        const endpoint = "http://localhost:3000/api/get-cart";
        const sendPackage = {
            method: "POST",
            headers: { "Content-Type": "application/json" } 
        };

        fetch(endpoint, sendPackage)
            .then((response) => response.json())
            .then((item) => {
                console.log(item)
                cart += ``
            })
            .catch((err) => console.error("Error fetching details:", err));
    }
    cart.style.display = "flex";
}

const closeCart = () => {
    const cart = document.getElementById("cartContainer");
    cart.style.display = "none";
};
