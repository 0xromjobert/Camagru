import { fetchWithAuth  } from "./utils.js";
import { showAlert } from "./components/alertComponent.js";

document.addEventListener('DOMContentLoaded', async () => {
    const resp = await fetchWithAuth('/api/user/userinfo');
    if (resp){
        const data = await resp.json();
        if (!data.username)
            document.getElementById('welcomeMessage').innerText = data.message;
            
        else
        {
            document.getElementById('welcomeMessage').innerHTML = `you are now logged in <b>${data.username}</b>, you can like and comment pictures, as well as adding your own !`;
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
            showAlert('Failed to log out.');
    }
    catch(error) {
        showAlert('An unexpected error occurred.');
    }
});

document.getElementById('edit').addEventListener('click', ()=>{
    window.location.href = '/profile/edit';
});

function buildTable(data) {
    try {
      // Create the table element
      const table = document.createElement('table');
      table.className = 'table table-bordered table-striped-columns table-hover'; // Add Bootstrap classes
  
      // Create the table body
      const tbody = document.createElement('tbody');
  
      // Loop through the data object
      Object.entries(data).forEach(([key, value]) => {
        // Create a new row for each key-value pair
        const row = document.createElement('tr');
  
        // Create the field (left element)
        const fieldCell = document.createElement('td');
        fieldCell.innerText = key.replace('_', ' ').toUpperCase(); // Format key
        fieldCell.className = 'fw-bold'; // Bootstrap class for bold text
        row.appendChild(fieldCell);
  
        // Create the value (right element)
        const valueCell = document.createElement('td');
        valueCell.innerText = value; // Add the value
        row.appendChild(valueCell);
  
        // Append the row to the tbody
        tbody.appendChild(row);
      });
  
      // Append tbody to the table
      table.appendChild(tbody);
  
      // Insert the table into the DOM
      const container = document.getElementById('userInfoTable');
      container.innerHTML = ''; // Clear existing content
      container.appendChild(table);
    } catch (error) {
      showAlert('Failed to load user information.');
    }
  }

/* 
Function for yes/no form checck slider update
*/
async function loadNotifPref() {
    try {
        const resp = await fetch("/api/user/notif");
        if (!resp.ok) throw new Error("Failed to fetch notification preference");
        const data = await resp.json();
        return data.notif_status.has_notif; // True or False
    } catch (error) {
        console.error(error);
        return false; // Default to "No" in case of an error
    }
}

async function renderNotifToggle() {
    const notifTogglePlaceholder = document.getElementById("notifTogglePlaceholder");
    const hasNotif = await loadNotifPref();

    // Create the slider toggle UI with a badge
    notifTogglePlaceholder.innerHTML = `
        <label class="me-3 fw-bold" for="notifSwitch">Receive Notification Emails:</label>
        <div class="form-check form-switch d-flex align-items-center">
            <input class="form-check-input" type="checkbox" id="notifSwitch" ${hasNotif ? "checked" : ""}>
            <span id="notifBadge" class="badge ${hasNotif ? "bg-success" : "bg-secondary"} ms-3">
                ${hasNotif ? "Yes" : "No"}
            </span>
        </div>
    `;

    // Add event listener to handle toggling
    const notifSwitch = document.getElementById("notifSwitch");
    const notifBadge = document.getElementById("notifBadge");

    notifSwitch.addEventListener("change", async () => {
        const isChecked = notifSwitch.checked;
        notifBadge.textContent = isChecked ? "Yes" : "No";
        notifBadge.classList.toggle("bg-success", isChecked);
        notifBadge.classList.toggle("bg-secondary", !isChecked);

        // Update the server with the new preference
        try {
            const resp = await fetch("/api/user/notif", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notif_status: isChecked }),
            });
            if (!resp.ok) {
                console.error("Failed to update notification preference");
            }
        } catch (error) {
            console.error("Error updating notification preference:", error);
        }
    });
}

// Call renderNotifToggle on page load
document.addEventListener("DOMContentLoaded", renderNotifToggle);

// Call renderNotifToggle on page load
document.addEventListener("DOMContentLoaded", renderNotifToggle);