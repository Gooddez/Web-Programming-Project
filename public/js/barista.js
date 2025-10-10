// /js/barista.js

// Select all buttons with the .confirm-action-button class
const confirmButtons = document.querySelectorAll('.confirm-action-button');

if (confirmButtons) {
    confirmButtons.forEach(button => {
        // Store the original text
        button.dataset.originalText = button.textContent;

        button.addEventListener('click', function() {
            // 'this' is the specific button that was clicked

            if (this.classList.contains('confirm-needed')) {
                // --- SECOND CLICK ---
                const targetUrl = this.dataset.href;
                console.log('ACTION CONFIRMED: Navigating to ' + targetUrl);
                
                // Redirect the browser
                window.location.href = targetUrl;

            } else {
                // --- FIRST CLICK ---
                // Reset any other primed buttons first
                confirmButtons.forEach(btn => {
                    if (btn !== this) {
                        btn.classList.remove('confirm-needed');
                        btn.textContent = btn.dataset.originalText;
                    }
                });

                // Prime the clicked button
                this.classList.add('confirm-needed');
                this.textContent = 'แน่ใจหรือไม่?';
                
                // Set a timer to reset it
                setTimeout(() => {
                    this.classList.remove('confirm-needed');
                    this.textContent = this.dataset.originalText;
                }, 3000);
            }
        });
    });
}