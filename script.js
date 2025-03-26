document.addEventListener("DOMContentLoaded", () => {
    // Default HTML template
    const defaultHtml = `<!DOCTYPE html>
  <html>
  <head>
    <title>My HTML Page</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        line-height: 1.6;
      }
      h1 {
        color: #0070f3;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #eaeaea;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to HTML Editor</h1>
      <p>This is a paragraph of text. You can edit this HTML code on the left side.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <button>Click Me</button>
    </div>
  </body>
  </html>`
  
    // DOM Elements
    const editorContainer = document.getElementById("editor-container")
    const previewContainer = document.getElementById("preview-container")
    const preview = document.getElementById("preview")
    const toggleViewBtn = document.getElementById("toggle-view-btn")
    const copyBtn = document.getElementById("copy-btn")
    const saveBtn = document.getElementById("save-btn")
    const loadBtn = document.getElementById("load-btn")
    const downloadBtn = document.getElementById("download-btn")
    const uploadBtn = document.getElementById("upload-btn")
    const themeBtn = document.getElementById("theme-btn")
    const themeIcon = document.getElementById("theme-icon")
    const fileInput = document.getElementById("file-input")
  
    // State
    let editor = null
    let isMobile = window.innerWidth < 768
    let showPreview = true
    let currentTheme = localStorage.getItem("theme") || "light"
    let editorInitialized = false
    const resizeTimeout = null
  
    // Debounce function to limit how often a function can be called
    function debounce(func, wait) {
      let timeout
      return function (...args) {
        
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }
  
    // Initialize layout before Monaco loads
    function initLayout() {
      document.body.setAttribute("data-theme", currentTheme)
      updateThemeIcon()
      checkMobile()
    }
  
    // Initialize Monaco Editor with a delay to ensure DOM is ready
    function initMonacoEditor() {
      // Check if user is logged in
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      if (!currentUser) return
  
      if (editorInitialized) return
  
      // Set a flag to prevent multiple initializations
      editorInitialized = true
  
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        require(["vs/editor/editor.main"], () => {
          try {
            // declare monaco
            const monaco = window.monaco
            // Get user-specific saved HTML or default
            const userId = currentUser.id
            const savedHtml = localStorage.getItem(`savedHtml_${userId}`) || defaultHtml
  
            // Create editor with stable dimensions
            editor = monaco.editor.create(document.getElementById("editor"), {
              value: savedHtml,
              language: "html",
              theme: currentTheme === "dark" ? "vs-dark" : "vs",
              minimap: { enabled: false },
              automaticLayout: false, // Disable automatic layout to prevent ResizeObserver issues
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
              lineNumbers: "on",
              tabSize: 2,
            })
  
            // Update preview when editor content changes
            editor.onDidChangeModelContent(debounce(updatePreview, 300))
  
            // Initial preview update
            updatePreview()
  
            // Manual layout update after creation
            setTimeout(() => {
              if (editor) {
                editor.layout()
              }
            }, 100)
  
            // Add a safer resize handler
            window.addEventListener("resize", debounce(handleResize, 100))
          } catch (error) {
            console.error("Error initializing Monaco Editor:", error)
          }
        })
      }, 300)
    }
  
    // Handle resize events safely
    function handleResize() {
      isMobile = window.innerWidth < 768
      checkMobile()
  
      // Only update layout if editor exists
      if (editor) {
        try {
          editor.layout()
        } catch (error) {
          console.error("Error during editor layout:", error)
        }
      }
    }
  
    // Update preview iframe with editor content
    function updatePreview() {
      if (!editor) return
  
      try {
        const html = editor.getValue()
        const iframe = document.getElementById("preview")
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  
        iframeDoc.open()
        iframeDoc.write(html)
        iframeDoc.close()
      } catch (error) {
        console.error("Error updating preview:", error)
      }
    }
  
    // Toggle between editor and preview on mobile
    function toggleView() {
      if (!isMobile) return
  
      showPreview = !showPreview
  
      if (showPreview) {
        editorContainer.classList.add("hidden")
        editorContainer.classList.remove("fullscreen")
        previewContainer.classList.remove("hidden")
        previewContainer.classList.add("fullscreen")
      } else {
        previewContainer.classList.add("hidden")
        previewContainer.classList.remove("fullscreen")
        editorContainer.classList.remove("hidden")
        editorContainer.classList.add("fullscreen")
      }
  
      // Safely update editor layout after DOM changes
      setTimeout(() => {
        if (editor) {
          try {
            editor.layout()
          } catch (error) {
            console.error("Error during toggle view layout:", error)
          }
        }
      }, 100)
    }
  
    // Copy HTML to clipboard
    function copyToClipboard() {
      if (!editor) return
  
      try {
        const html = editor.getValue()
        navigator.clipboard
          .writeText(html)
          .then(() => alert("HTML copied to clipboard!"))
          .catch((err) => console.error("Failed to copy: ", err))
      } catch (error) {
        console.error("Error copying to clipboard:", error)
      }
    }
  
    // Save HTML to localStorage (user-specific)
    function saveToLocalStorage() {
      if (!editor) return
  
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"))
        if (!currentUser) return
  
        const userId = currentUser.id
        const html = editor.getValue()
        localStorage.setItem(`savedHtml_${userId}`, html)
        alert("HTML saved to browser storage!")
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    }
  
    // Load HTML from localStorage (user-specific)
    function loadFromLocalStorage() {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"))
        if (!currentUser) return
  
        const userId = currentUser.id
        const savedHtml = localStorage.getItem(`savedHtml_${userId}`)
  
        if (savedHtml && editor) {
          editor.setValue(savedHtml)
          alert("HTML loaded from browser storage!")
        } else {
          alert("No saved HTML found in browser storage.")
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error)
      }
    }
  
    // Download HTML as file
    function downloadHtml() {
      if (!editor) return
  
      try {
        const html = editor.getValue()
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "index.html"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error downloading HTML:", error)
      }
    }
  
    // Upload HTML file
    function uploadHtml(event) {
      try {
        const file = event.target.files[0]
        if (file && editor) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const content = e.target.result
              editor.setValue(content)
            } catch (error) {
              console.error("Error setting editor value:", error)
            }
          }
          reader.readAsText(file)
        }
      } catch (error) {
        console.error("Error uploading HTML:", error)
      }
    }
  
    // Toggle theme (light/dark)
    function toggleTheme() {
      try {
        currentTheme = currentTheme === "light" ? "dark" : "light"
        localStorage.setItem("theme", currentTheme)
  
        // Update body theme
        document.body.setAttribute("data-theme", currentTheme)
  
        // Update editor theme if initialized
        if (editor) {
          monaco.editor.setTheme(currentTheme === "dark" ? "vs-dark" : "vs")
        }
  
        // Update theme icon
        updateThemeIcon()
      } catch (error) {
        console.error("Error toggling theme:", error)
      }
    }
  
    // Update theme icon based on current theme
    function updateThemeIcon() {
      try {
        if (currentTheme === "dark") {
          themeIcon.innerHTML =
            '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        } else {
          themeIcon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
        }
      } catch (error) {
        console.error("Error updating theme icon:", error)
      }
    }
  
    // Check if mobile and set up view accordingly
    function checkMobile() {
      try {
        if (isMobile) {
          if (showPreview) {
            editorContainer.classList.add("hidden")
            editorContainer.classList.remove("fullscreen")
            previewContainer.classList.remove("hidden")
            previewContainer.classList.add("fullscreen")
          } else {
            previewContainer.classList.add("hidden")
            previewContainer.classList.remove("fullscreen")
            editorContainer.classList.remove("hidden")
            editorContainer.classList.add("fullscreen")
          }
        } else {
          editorContainer.classList.remove("hidden", "fullscreen")
          previewContainer.classList.remove("hidden", "fullscreen")
        }
      } catch (error) {
        console.error("Error checking mobile view:", error)
      }
    }
  
    // Event Listeners - using try/catch for safety
    try {
      toggleViewBtn.addEventListener("click", toggleView)
      copyBtn.addEventListener("click", copyToClipboard)
      saveBtn.addEventListener("click", saveToLocalStorage)
      loadBtn.addEventListener("click", loadFromLocalStorage)
      downloadBtn.addEventListener("click", downloadHtml)
      uploadBtn.addEventListener("click", () => fileInput.click())
      fileInput.addEventListener("change", uploadHtml)
      themeBtn.addEventListener("click", toggleTheme)
    } catch (error) {
      console.error("Error setting up event listeners:", error)
    }
  
    // Initialize layout first
    initLayout()
  
    // Initialize Monaco Editor after a short delay
    initMonacoEditor()
  
    // Listen for auth changes
    window.addEventListener("auth-changed", () => {
      // Dispose of existing editor if it exists
      if (editor) {
        editor.dispose()
        editor = null
        editorInitialized = false
      }
  
      // Reinitialize if logged in
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      if (currentUser) {
        initMonacoEditor()
      }
    })
  })
  
  