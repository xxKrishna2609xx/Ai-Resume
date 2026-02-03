const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusDiv = document.getElementById('status');
const resultBox = document.getElementById('result-box');
const summaryName = document.getElementById('summary-name');
const summaryExp = document.getElementById('summary-exp');
const summaryScore = document.getElementById('summary-score');
const summarySkills = document.getElementById('summary-skills');
const summaryText = document.getElementById('summary-text');

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
['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    }, false);
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
        
        // Display a nicer summary
        resultBox.classList.remove('hidden');
        const analysis = data?.ai_analysis || {};
        if (summaryName) {
            summaryName.textContent = analysis.candidate_name || "Unknown";
        }
        if (summaryExp) {
            summaryExp.textContent = analysis.experience_years !== undefined
                ? `${analysis.experience_years} years`
                : "N/A";
        }
        if (summaryScore) {
            summaryScore.textContent = analysis.resume_quality_score !== undefined
                ? `${analysis.resume_quality_score}/10`
                : "N/A";
        }

        // Render skills as tags
        if (summarySkills) {
            summarySkills.innerHTML = "";
            const skills = Array.isArray(analysis.skills) ? analysis.skills.slice(0, 12) : [];
            if (skills.length === 0) {
                const emptyTag = document.createElement('span');
                emptyTag.className = 'tag tag-muted';
                emptyTag.textContent = 'No skills found';
                summarySkills.appendChild(emptyTag);
            } else {
                skills.forEach((skill) => {
                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.textContent = skill;
                    summarySkills.appendChild(tag);
                });
            }
        }

        if (summaryText) {
            summaryText.textContent = analysis.summary || "No summary available.";
        }

    } catch (error) {
        statusDiv.textContent = `❌ Upload Failed: ${error.message}`;
        statusDiv.style.color = "red";
        console.error(error);
    }
}