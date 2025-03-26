document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const authContainer = document.getElementById("auth-container")
    const appContainer = document.getElementById("app-container")
    const loginTab = document.getElementById("login-tab")
    const signupTab = document.getElementById("signup-tab")
    const loginForm = document.getElementById("login-form")
    const signupForm = document.getElementById("signup-form")
    const loginError = document.getElementById("login-error")
    const signupError = document.getElementById("signup-error")
    const logoutBtn = document.getElementById("logout-btn")
    const userModal = document.getElementById("user-modal")
    const userInfo = document.getElementById("user-info")
    const closeModal = document.querySelector(".close-modal")
  
    // Check if user is already logged in
    function checkAuth() {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      if (currentUser) {
        authContainer.style.display = "none"
        appContainer.style.display = "flex"
        return true
      } else {
        authContainer.style.display = "flex"
        appContainer.style.display = "none"
        return false
      }
    }
  
    // Tab switching
    loginTab.addEventListener("click", () => {
      loginTab.classList.add("active")
      signupTab.classList.remove("active")
      loginForm.style.display = "flex"
      signupForm.style.display = "none"
      loginError.textContent = ""
      signupError.textContent = ""
    })
  
    signupTab.addEventListener("click", () => {
      signupTab.classList.add("active")
      loginTab.classList.remove("active")
      signupForm.style.display = "flex"
      loginForm.style.display = "none"
      loginError.textContent = ""
      signupError.textContent = ""
    })
  
    // Login form submission
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const email = document.getElementById("login-email").value
      const password = document.getElementById("login-password").value
  
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []
  
      // Find user
      const user = users.find((u) => u.email === email && u.password === password)
  
      if (user) {
        // Store current user (without password)
        const currentUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        }
  
        localStorage.setItem("currentUser", JSON.stringify(currentUser))
  
        // Show app
        authContainer.style.display = "none"
        appContainer.style.display = "flex"
  
        // Reset form
        loginForm.reset()
        loginError.textContent = ""
  
        // Trigger editor initialization
        window.dispatchEvent(new Event("auth-changed"))
      } else {
        loginError.textContent = "Invalid email or password"
      }
    })
  
    // Signup form submission
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const name = document.getElementById("signup-name").value
      const email = document.getElementById("signup-email").value
      const password = document.getElementById("signup-password").value
      const confirmPassword = document.getElementById("signup-confirm").value
  
      // Validate passwords match
      if (password !== confirmPassword) {
        signupError.textContent = "Passwords do not match"
        return
      }
  
      // Get existing users
      const users = JSON.parse(localStorage.getItem("users")) || []
  
      // Check if email already exists
      if (users.some((user) => user.email === email)) {
        signupError.textContent = "Email already in use"
        return
      }
  
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, this should be hashed
        createdAt: new Date().toISOString(),
      }
  
      // Add to users array
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
  
      // Store current user (without password)
      const currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      }
  
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
  
      // Show app
      authContainer.style.display = "none"
      appContainer.style.display = "flex"
  
      // Reset form
      signupForm.reset()
      signupError.textContent = ""
  
      // Trigger editor initialization
      window.dispatchEvent(new Event("auth-changed"))
    })
  
    // Logout
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser")
      authContainer.style.display = "flex"
      appContainer.style.display = "none"
  
      // Trigger auth changed event
      window.dispatchEvent(new Event("auth-changed"))
    })
  
    // User profile modal
    logoutBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault()
  
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      if (currentUser) {
        userInfo.innerHTML = `
          <p><strong>Name:</strong> ${currentUser.name}</p>
          <p><strong>Email:</strong> ${currentUser.email}</p>
          <p><strong>Account Created:</strong> ${new Date(currentUser.createdAt).toLocaleString()}</p>
        `
  
        userModal.style.display = "block"
      }
    })
  
    // Close modal
    closeModal.addEventListener("click", () => {
      userModal.style.display = "none"
    })
  
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === userModal) {
        userModal.style.display = "none"
      }
    })
  
    // Check auth on load
    checkAuth()
  })
  
  