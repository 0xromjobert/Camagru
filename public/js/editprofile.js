import { showAlert } from "./components/alertComponent.js";

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
    const result = await response.json();
    console.log('resp',response);
    console.log('resp ok',response.ok);
    console.log('result',result);
    if (response.ok && result.code !== 400){
      window.location.href = '/profile'; // Redirect to profile page
    }
    else {
      console.log('the error message is',result.message)
      result.message? showAlert(result.message) : null;
      if (result.errors) {
        for (const error of result.errors) {
            showAlert(error.msg);  
            console.error(error);
        }
      }
    }
  });
  document.getElementById('goHome').addEventListener('click', () =>{
    window.location.href = '/';
  })