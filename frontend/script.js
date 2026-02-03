const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusDiv = document.getElementById('status');
const resultBox = document.getElementById('result-box');
const summaryName = document.getElementById('summary-name');
const summaryExp = document.getElementById('summary-exp');
const summaryScore = document.getElementById('summary-score');
const summarySkills = document.getElementById('summary-skills');
const summaryText = document.getElementById('summary-text');
const findJobsBtn = document.getElementById('find-jobs-btn');

// Job Panel Elements
const jobFilters = document.getElementById('job-filters');
const jobStatus = document.getElementById('job-status');
const jobResults = document.getElementById('job-results');
const jobsList = document.getElementById('jobs-list');
const jobEmpty = document.getElementById('job-empty-state');
const searchJobsBtn = document.getElementById('search-jobs-btn');
const matchResumeBtn = document.getElementById('match-resume-btn');
const jobModal = document.getElementById('job-modal');
const modalClose = document.querySelector('.modal-close');

// Store current resume data
let currentResumeId = null;
let currentResumeData = null;

// ==========================================
// PART 1: RESUME UPLOAD & ANALYSIS
// ==========================================

// 1. Handle Click to Browse
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        uploadFile(e.target.files[0]);
    }
});

// 2. Handle Drag & Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

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

dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
});

// 3. The Upload Logic (Talks to FastAPI)
async function uploadFile(file) {
    if (file.type !== 'application/pdf') {
        statusDiv.textContent = "❌ Error: Please upload a PDF file.";
        statusDiv.style.color = "red";
        return;
    }

    statusDiv.textContent = `⏳ Uploading ${file.name}...`;
    statusDiv.style.color = "blue";
    resultBox.classList.add('hidden');
    findJobsBtn.classList.add('hidden');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://127.0.0.1:8000/upload-resume', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        const data = await response.json();

        statusDiv.textContent = "✅ Analysis Complete!";
        statusDiv.style.color = "green";
        
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

        // Store resume ID and show job matching UI
        currentResumeId = data.id;
        currentResumeData = analysis;
        findJobsBtn.classList.remove('hidden');
        jobFilters.classList.remove('hidden');
        matchResumeBtn.classList.remove('hidden');
        jobEmpty.classList.add('hidden');

    } catch (error) {
        statusDiv.textContent = `❌ Upload Failed: ${error.message}`;
        statusDiv.style.color = "red";
        console.error(error);
    }
}

// ==========================================
// PART 2: JOB SEARCH & MATCHING
// ==========================================

// Find Matching Jobs button
findJobsBtn.addEventListener('click', () => {
    matchResumeToJobs();
});

// Search Jobs button
searchJobsBtn.addEventListener('click', () => {
    searchJobs();
});

// Match Resume button
matchResumeBtn.addEventListener('click', () => {
    matchResumeToJobs();
});

async function searchJobs() {
    const location = document.getElementById('job-location').value;
    const jobTitle = document.getElementById('job-title').value;
    const jobType = document.getElementById('job-type').value;
    const minSalary = parseInt(document.getElementById('min-salary').value) || null;

    showJobStatus('🔍 Searching jobs...');
    jobResults.classList.add('hidden');
    jobsList.innerHTML = '';

    try {
        const response = await fetch('http://127.0.0.1:8000/jobs/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                location: location,
                job_title: jobTitle,
                min_salary: minSalary,
                job_types: jobType ? [jobType] : [],
                results_per_page: 20,
                page: 1
            })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        const data = await response.json();
        displayJobs(data.jobs, false);
        showJobStatus('');

    } catch (error) {
        showJobStatus(`❌ Search failed: ${error.message}`);
        console.error(error);
    }
}

async function matchResumeToJobs() {
    if (!currentResumeId) {
        showJobStatus('❌ Please upload a resume first');
        return;
    }

    const jobTitle = document.getElementById('job-title').value || '';

    showJobStatus('⭐ Matching jobs to your resume...');
    jobResults.classList.add('hidden');
    jobsList.innerHTML = '';

    try {
        const response = await fetch('http://127.0.0.1:8000/jobs/match-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resume_id: currentResumeId,
                job_title: jobTitle,
                location: document.getElementById('job-location').value,
                results_per_page: 20
            })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        const data = await response.json();
        displayJobs(data.jobs, true);
        showJobStatus('');

    } catch (error) {
        showJobStatus(`❌ Matching failed: ${error.message}`);
        console.error(error);
    }
}

function displayJobs(jobs, showMatchScore = false) {
    if (!jobs || jobs.length === 0) {
        jobEmpty.classList.remove('hidden');
        jobResults.classList.add('hidden');
        return;
    }

    jobEmpty.classList.add('hidden');
    jobResults.classList.remove('hidden');

    const jobCountEl = document.querySelector('.job-count');
    if (jobCountEl) {
        jobCountEl.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;
    }

    jobsList.innerHTML = jobs.map((job, index) => {
        const salary = job.salary_min && job.salary_max 
            ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
            : job.salary_max 
            ? `up to $${(job.salary_max / 1000).toFixed(0)}k`
            : 'Salary not listed';

        const matchScore = job.match_score ? Math.round(job.match_score) : null;

        return `
            <div class="job-card" data-job-index="${index}">
                <div class="job-card-title">${job.title}</div>
                <div class="job-card-company">${job.company || 'Company'}</div>
                <div class="job-card-meta">
                    <div class="job-card-location">📍 ${job.location || 'Location'}</div>
                    <div class="job-card-type">${job.job_type || 'Job Type'}</div>
                </div>
                <div class="job-card-salary">💰 ${salary}</div>
                ${matchScore !== null ? `
                    <div class="job-card-score">
                        <span class="match-badge">Match: ${matchScore}%</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    // Add click handlers to job cards
    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.getAttribute('data-job-index'));
            showJobModal(jobs[index]);
        });
    });
}

function showJobModal(job) {
    document.getElementById('modal-title').textContent = job.title;
    document.getElementById('modal-company').textContent = job.company || 'N/A';
    document.getElementById('modal-location').textContent = job.location || 'N/A';

    const salary = job.salary_min && job.salary_max 
        ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
        : job.salary_max 
        ? `up to $${(job.salary_max / 1000).toFixed(0)}k`
        : 'Salary not listed';
    document.getElementById('modal-salary').textContent = salary;

    // Match Score Bar
    if (job.match_score) {
        const scorePercent = Math.min(100, Math.round(job.match_score));
        document.getElementById('modal-score-bar').style.width = scorePercent + '%';
        document.getElementById('modal-score-text').textContent = `${scorePercent}% match to your profile`;
    } else {
        document.getElementById('modal-score-bar').style.width = '0%';
        document.getElementById('modal-score-text').textContent = 'No match data available';
    }

    // Matching Skills
    const matchingSkillsEl = document.getElementById('modal-matching-skills');
    matchingSkillsEl.innerHTML = '';
    if (job.matching_skills && job.matching_skills.length > 0) {
        job.matching_skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = skill;
            matchingSkillsEl.appendChild(tag);
        });
    } else {
        const tag = document.createElement('span');
        tag.className = 'tag tag-muted';
        tag.textContent = 'No matching skills';
        matchingSkillsEl.appendChild(tag);
    }

    // Requirements
    const requirementsEl = document.getElementById('modal-requirements');
    requirementsEl.innerHTML = '';
    if (job.requirements && job.requirements.length > 0) {
        job.requirements.forEach(req => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = req;
            requirementsEl.appendChild(tag);
        });
    } else {
        const tag = document.createElement('span');
        tag.className = 'tag tag-muted';
        tag.textContent = 'No requirements listed';
        requirementsEl.appendChild(tag);
    }

    // Description
    document.getElementById('modal-description').textContent = job.description || 'No description available';

    // Apply Button
    const applyBtn = document.getElementById('modal-apply-btn');
    if (job.url) {
        applyBtn.href = job.url;
        applyBtn.style.display = 'inline-block';
    } else {
        applyBtn.style.display = 'none';
    }

    jobModal.classList.remove('hidden');
}

function showJobStatus(message) {
    if (message) {
        jobStatus.textContent = message;
        jobStatus.classList.remove('hidden');
    } else {
        jobStatus.classList.add('hidden');
    }
}

// Modal Close
modalClose.addEventListener('click', () => {
    jobModal.classList.add('hidden');
});

jobModal.addEventListener('click', (e) => {
    if (e.target === jobModal) {
        jobModal.classList.add('hidden');
    }
});