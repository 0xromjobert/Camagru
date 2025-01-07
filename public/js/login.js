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
    if (response.ok)
      window.location.href = '/profile'; // Redirect to page
    else {
      result.message? alert(result.message) :null;
      if (result.errors) {
        for (const error of result.errors) {
          alert(error.msg);
          console.error(error);
        }
      }
    }
  });

  document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const response = await fetch('/api/auth/reset-request', {
      method: 'POST',
      body: JSON.stringify({email: formData.get('email')}),
      headers: { 'Content-Type': 'application/json' },
    })
    console.log(response);
    const result = await response.json();
    if (response.ok)
      window.location.href = '/'; // Redirect to test page
    else {
      result.message? alert(result.message) : null;
      if (result.errors) {
        for (const error of result.errors) {
          alert(error.msg);
          console.error(error);
        }
      }
    }
});