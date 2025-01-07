document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const response = await fetch('/api/user/edit', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(response);
    const result = await response.json();
    if (response.ok)
      window.location.href = '/profile'; // Redirect to profile page
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
  document.getElementById('goHome').addEventListener('click', () =>{
    window.location.href = '/';
  })