import { showAlert } from "./components/alertComponent.js";

document.getElementById('resetForm').addEventListener('submit', async (e)=>{

    e.preventDefault();
    const formData = new FormData(e.target);
    const resp = await fetch('/api/auth/reset-password', {
        method: "POST",
        body: JSON.stringify({
            password : formData.get('password'),
            confirmPassword: formData.get('confirmpassword')}),
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await resp.json();
    if (resp.ok)
    {
        showAlert(data.message);
        window.location.href = '/auth/login';
    }
    else {
        data.message? showAlert(data.message): null;
        if (data.errors){
            for (const error of data.errors){
                showAlert(error.msg);
            }
        }
    }
});
