function showItem(id) {
    // Select the container where all the details will be displayed
    const parent = document.getElementById("descContent");

    // If the container doesn't exist, stop to prevent errors
    if (!parent) {
        console.error("Error: Container with id 'descContent' not found.");
        return;
    }

    const endpoint = `${window.location.origin}/api/waiting-order`;
    fetch(endpoint)
        .then((response) => response.json())
        .then((orders) => {
            let moreHTML = ''; // Start with an empty string

            // Build the HTML for all the orders
            orders.forEach(item => {
                // Find the specific order that matches the clicked ID to highlight it later if needed
                if (item.waiting_id === parseInt(id)) {
                    
                    // Start the container for the item's details
                    moreHTML += `<div id="item-${item.waiting_id}" class="desc-container">`;
                    
                    const menuContent = JSON.parse(item.menu);

                    menuContent.forEach(product => {
                        moreHTML += `
                            <div class="desc-text">
                                <p><strong>${product.menu_name}</strong></p>
                                <p>รายละเอียด : ${product.options.map(opt => opt.name).join(', ')}</p>
                            </div>
                            <p>${product.totalPrice} บาท</p>
                        `;
                    });

                    // Close the container for the item's details
                    moreHTML += `</div>`;
                }
            });

            // Set the container's HTML with the generated content ONCE, at the end.
            parent.innerHTML = moreHTML;

            const show = document.getElementById(`item-${id}`)
            show.style.display = "grid"
        })
        .catch((err) => console.error("Error fetching details:", err));
}