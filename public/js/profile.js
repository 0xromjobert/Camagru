import { fetchWithAuth  } from "./utils.js";

document.addEventListener('DOMContentLoaded', async () => {
    const resp = await fetchWithAuth('/api/user/userinfo');
    if (resp){
        const data = await resp.json();
        if (!data.username)
            document.getElementById('welcomeMessage').innerText = data.message;
            
        else
        {
            document.getElementById('welcomeMessage').innerText = `you are logged in ${data.username}!`;
            if (data.created_at)
                data.created_at = new Date(data.created_at).toLocaleString();
            buildTable(data);
        }
    }
});

document.getElementById('logout').addEventListener('click', async() => {
    try{
        const resp = await fetchWithAuth('/api/auth/logout', { method: 'GET' });
        if (resp.ok)
            window.location.href = '/auth/login'; // Redirect to login page
        else
            alert('Failed to log out.');
    }
    catch(error) {
        console.error('Logout error:', error);
        alert('An unexpected error occurred.');
    }
});

document.getElementById('edit').addEventListener('click', ()=>{
    window.location.href = '/profile/edit';
});

function buildTable(data){
    try {
        const table = document.createElement('table');
        table.setAttribute('border', '1'); // Add borders for clarity

        //adding header
        const headerRow = document.createElement('tr');
        Object.keys(data).forEach((key) => {
            const th = document.createElement('th');
            th.innerText = key.replace('_', ' ').toUpperCase(); // Capitalize and format keys
            table.appendChild(headerRow);
            headerRow.appendChild(th);
        });

        // Add table row for data
        const dataRow = document.createElement('tr');
        Object.values(data).forEach((value) => {
               const td = document.createElement('td');
               td.innerText = value;
               dataRow.appendChild(td);
           });
           table.appendChild(dataRow);
           // Insert table into the DOM
           document.getElementById('userInfoTable').appendChild(table);
       } 
       catch (error) {
           console.error('Error loading user information:', error);
           alert('Failed to load user information.');
    }
}