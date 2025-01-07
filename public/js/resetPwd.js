document.getElementById('resetForm').addEventListener('submit', async (e)=>{

    e.preventDefault();
    const formData = new FormData(e.target);
    const resp = await fetch('/api/auth/reset-password', {
        method: "POST",
        body: JSON.stringify({
            password : formData.get('password'),
            confirmPassword: formData.get('confirmpassword')}),
        headers: { 'Content-Type': 'application/json' },
    })
    console.log(resp);
    const data = await resp.json();
    if (resp.ok)
    {
        alert(data.message);
        window.location.href = '/auth/login';
    }
    data.message? alert(data.message):alert("ISSUE: Could not reset your password");
    if (data.errors){
        for (const error in data.errors){
            console.log(error);
        }
    }
});
