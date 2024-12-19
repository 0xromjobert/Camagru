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
    console.log(result);
    if (result.success) {
      window.location.href = '/edit'; // Redirect to edit page
    } else {
      alert('Invalid credentials');
      if (result.errors) {
        for (const error of result.errors) {
          console.error(error);
        }
      }
    }
});