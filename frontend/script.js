const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusDiv = document.getElementById('status');
const resultBox = document.getElementById('result-box');
const jsonOutput = document.getElementById('json-output');

// 1. Handle Click to Browse
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        uploadFile(e.target.files[0]);
    }
});

// 2. Handle Drag & Drop Events
// Prevent default behavior (browser opening the file)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when dragging over
['dragenter', 'dragover'].forEach(() => {
    dropZone.classList.add('drag-over');
});

['dragleave', 'drop'].forEach(() => {
    dropZone.classList.remove('drag-over');
});

// Handle the actual file drop
dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
});

// 3. The Upload Logic (Talks to FastAPI)
async function uploadFile(file) {
    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
        statusDiv.textContent = "❌ Error: Please upload a PDF file.";
        statusDiv.style.color = "red";
        return;
    }

    // Show loading state
    statusDiv.textContent = `⏳ Uploading ${file.name}...`;
    statusDiv.style.color = "blue";
    resultBox.classList.add('hidden');

    // Prepare data for backend
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Send to FastAPI (Make sure your backend is running!)
        const response = await fetch('http://127.0.0.1:8000/upload-resume', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Show Success
        statusDiv.textContent = "✅ Analysis Complete!";
        statusDiv.style.color = "green";
        
        // Display Raw JSON (You can format this nicely later)
        resultBox.classList.remove('hidden');
        jsonOutput.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        statusDiv.textContent = `❌ Upload Failed: ${error.message}`;
        statusDiv.style.color = "red";
        console.error(error);
    }
}