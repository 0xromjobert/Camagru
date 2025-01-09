class NavBar extends HTMLElement {
    constructor() {
      super();
  
      // Initial Navbar HTML structure
      this.innerHTML = `
        <nav class="navbar">
          <div class="navbar-container">
            <a class="navbar-brand" href="/">CAMAGRU</a>
            <button class="navbar-toggler" aria-expanded="false" aria-label="Toggle navigation">
              ☰
            </button>
            <div class="navbar-links">
              <ul id="navDynamic"></ul>
            </div>
          </div>
        </nav>
      `;
    }
  
    async connectedCallback() {
      const userLoggedIn = await this.checkUserState();
      const navButtons = this.querySelector("#navDynamic");
      if (userLoggedIn) {
        // Create "Profile" button
        const liProfile = document.createElement("li");
        const profileLink = document.createElement("a");
        profileLink.setAttribute("href", "/profile");
        profileLink.innerText = "Profile";
        liProfile.appendChild(profileLink);
        navButtons.appendChild(liProfile);
  
        // Create "Edit Content" button
        const liEdit = document.createElement("li");
        const editLink = document.createElement("a");
        editLink.setAttribute("href", "/editcontent");
        editLink.innerText = "Add Content";
        liEdit.appendChild(editLink);
        navButtons.appendChild(liEdit);
  
        // Create "Logout" button
        const liLogout = document.createElement("li");
        const logoutLink = document.createElement("a");
        logoutLink.setAttribute("href", "/api/auth/logout");
        logoutLink.classList.add("text-danger");
        logoutLink.innerText = "Logout";
        liLogout.appendChild(logoutLink);
        navButtons.appendChild(liLogout);
      } else {
        // Create "Login" button
        const liLogin = document.createElement("li");
        const loginLink = document.createElement("a");
        loginLink.setAttribute("href", "/auth/login");
        loginLink.innerText = "Login";
        liLogin.appendChild(loginLink);
        navButtons.appendChild(liLogin);
      }
  
      // Toggle menu visibility
      const toggleButton = this.querySelector(".navbar-toggler");
      const linksContainer = this.querySelector(".navbar-links");
  
      toggleButton.addEventListener("click", () => {
        const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
        toggleButton.setAttribute("aria-expanded", !isExpanded);
        linksContainer.classList.toggle("navbar-links-visible");
      });
    }
  
    async checkUserState() {
      try {
        const response = await fetch("/api/auth/status", { credentials: "include" });
        if (response.ok) {
            const data = await response.json();
            return data.loggedIn;
        }
      } catch (error) {
        return false; // Assume not logged in on error
        }
    }
}
  // Define the custom element
  customElements.define("nav-bar", NavBar);
  
  
  