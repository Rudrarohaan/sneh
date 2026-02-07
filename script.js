document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const initialContent = document.getElementById('initialContent');
    const successContent = document.getElementById('successContent');
    const bgMusic = document.getElementById('bgMusic');

    // Attempt to play music immediately
    if (bgMusic) {
        bgMusic.volume = 0.5; // Set a reasonable starting volume
        bgMusic.play().catch(error => {
            console.log("Autoplay blocked, waiting for interaction.");
            // Determine if we need to wait for interaction
            const playOnInteraction = () => {
                bgMusic.play().catch(e => console.log("Still explicitly blocked", e));
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction);
            document.addEventListener('touchstart', playOnInteraction);
        });
    }

    let hasMoved = false;

    // Function to move the NO button
    function moveNoButton() {
        // Calculate offsets
        const btnRect = noBtn.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        if (!hasMoved) {
            hasMoved = true;

            // Create spacer to hold the layout in the buttons container
            const spacer = document.createElement('div');
            spacer.style.width = `${btnRect.width}px`;
            spacer.style.height = `${btnRect.height}px`;
            spacer.style.display = 'inline-block';

            // Insert spacer where the button currently is
            noBtn.parentElement.insertBefore(spacer, noBtn);

            // Calculate current position relative to the card's coordinate system
            const initialLeft = btnRect.left - cardRect.left;
            const initialTop = btnRect.top - cardRect.top;

            // Move button to be a direct child of card so positioning is relative to card
            card.appendChild(noBtn);

            // Apply absolute positioning at the EXACT current visual spot
            noBtn.style.position = 'absolute';
            noBtn.style.left = `${initialLeft}px`;
            noBtn.style.top = `${initialTop}px`;
            noBtn.style.width = `${btnRect.width}px`;

            // Force reflow
            noBtn.offsetHeight;

            // Enable transition for subsequent movement
            noBtn.style.transition = "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
        }

        // Calculate maximum boundaries to keep button inside card
        const safetyMargin = 30;
        const maxLeft = cardRect.width - btnRect.width - safetyMargin;
        const maxTop = cardRect.height - btnRect.height - safetyMargin;

        // Generate random position
        let newLeft = Math.max(safetyMargin, Math.random() * maxLeft);
        let newTop = Math.max(safetyMargin, Math.random() * maxTop);

        // Apply new position
        noBtn.style.left = `${newLeft}px`;
        noBtn.style.top = `${newTop}px`;
    }

    // Event listeners
    noBtn.addEventListener('mouseover', moveNoButton);
    // Handle click/touch to move it and prevent actual click
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        moveNoButton();
    });
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveNoButton();
    });

    // --- TELEGRAM NOTIFICATION CONFIGURATION ---
    const botToken = '8598649834:AAFAj6lf87lHIJAHTY2E1wqdq9JLbQT3heA';
    const chatId = '1909742396';

    function sendTelegramNotification() {
        const message = "💖 SHE SAID YES! time to celebrate! 💖";

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Notification sent:', data);
                // alert("DEBUG: Message sent successfully!"); // Uncomment if you want confirmation
            })
            .catch(error => {
                console.error('Error sending notification:', error);
                alert(`Notification Failed: ${error.message}\nCheck your Bot Token!`);
            });
    }

    // YES button interaction
    yesBtn.addEventListener('click', () => {
        // Send Notification IMMEDIATELY
        sendTelegramNotification();

        // Fade out NO button using existing transition
        noBtn.style.opacity = '0';
        noBtn.style.pointerEvents = 'none'; // Prevent clicks during fade

        // Animate out initial content
        initialContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        initialContent.style.opacity = '0';
        initialContent.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            initialContent.style.display = 'none';
            noBtn.style.display = 'none'; // Ensure it's fully gone

            successContent.classList.remove('hidden');

            // Re-trigger animation cleanly
            successContent.style.animation = 'none';
            successContent.offsetHeight;
            successContent.style.animation = 'fadeIn 1s ease forwards';
        }, 600); // 600ms to match transitions
    });
});
