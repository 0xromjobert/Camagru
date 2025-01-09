import { showAlert } from "./components/alertComponent.js";

document.getElementById('SignupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  
    const result = await response.json();
    if (response.ok) {
      showAlert(result.message);
      window.location.href = '/auth/login'; // Redirect to edit page
    } 
    else {
      result.message? showAlert(result.message) : null;
      if (result.errors) {
        for (const error of result.errors) {
        showAlert(error.msg);
      }
    }
  }
});