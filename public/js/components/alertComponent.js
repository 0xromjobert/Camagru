// Use to have dismissing component added to pace holder on any html (with the placeholder ofc)

export function showAlert(message, type = 'danger') {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    if (!alertPlaceholder) {
        return;
    }

    // Create the alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`; // Styling remains the same
    alertDiv.role = 'alert';

    // Add message and close button
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
    `;

    // Add dismiss functionality with native JS
    alertDiv.querySelector('.btn-close').addEventListener('click', () => {
        alertDiv.classList.remove('show'); // Remove the 'show' class for fade-out effect
        alertDiv.addEventListener('transitionend', () => alertDiv.remove()); // Remove element after transition
    });

    // Append the alert to the placeholder
    alertPlaceholder.appendChild(alertDiv);

    // Optional: Auto-remove alert after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) { // Check if still in DOM (not manually dismissed)
            alertDiv.classList.remove('show');
            alertDiv.addEventListener('transitionend', () => alertDiv.remove());
        }
    }, 5000);
}
