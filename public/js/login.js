document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(response);
    const result = await response.json();
    if (response.ok) {
      token = result.token;
      localStorage.setItem('token', token); //later on cookie for xss
      window.location.href = '/auth/welcome'; // Redirect to test page
    } else {
      result.message? alert(result.message) : alert('Invalid credentials');
      if (result.errors) {
        for (const error of result.errors) {
          console.error(error);
        }
      }
    }
  });