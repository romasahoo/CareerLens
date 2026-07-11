document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("upload-form");
    const resumeFileInput = document.getElementById("resume-file");
    const fileMsg = document.querySelector(".file-msg");
    const analyzeBtn = document.getElementById("analyze-btn");
    const loadingSpinner = document.getElementById("loading-spinner");
    const errorMsg = document.getElementById("error-msg");
    const uploadPanel = document.getElementById("upload-panel");
    const resultsPanel = document.getElementById("results-panel");
    
    // API Keys
    const geminiInput = document.getElementById("gemini-key");
    const rapidapiInput = document.getElementById("rapidapi-key");

    // Profile elements
    const expVal = document.getElementById("exp-val");
    const roleVal = document.getElementById("role-val");
    const skillsContainer = document.getElementById("skills-container");

    // Job Search elements
    const searchQueryInput = document.getElementById("search-query");
    const searchBtn = document.getElementById("search-btn");
    const jobLoading = document.getElementById("job-loading");
    const jobError = document.getElementById("job-error");
    const jobsGrid = document.getElementById("jobs-grid");

    // File input change handler
    resumeFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            fileMsg.textContent = `Selected: ${e.target.files[0].name}`;
        } else {
            fileMsg.textContent = "Drag & drop your PDF resume here, or click to browse";
        }
    });

    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const geminiKey = geminiInput.value.trim();

        const file = resumeFileInput.files[0];
        if (!file) return;

        // UI State
        analyzeBtn.disabled = true;
        errorMsg.classList.add("hidden");
        loadingSpinner.classList.remove("hidden");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("gemini_key", geminiKey);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Analysis failed");
            }

            const data = await response.json();
            
            // Populate Profile
            expVal.textContent = `${data.experience_years || 0} Yrs`;
            const topRole = (data.desired_roles && data.desired_roles.length > 0) ? data.desired_roles[0] : "Professional";
            roleVal.textContent = topRole;

            skillsContainer.innerHTML = "";
            if (data.skills) {
                data.skills.forEach(skill => {
                    const span = document.createElement("span");
                    span.className = "skill-tag";
                    span.textContent = skill;
                    skillsContainer.appendChild(span);
                });
            }

            // Set default search query
            searchQueryInput.value = topRole;

            // Transition UI
            uploadPanel.classList.add("hidden");
            resultsPanel.classList.remove("hidden");

        } catch (err) {
            showError(errorMsg, err.message);
        } finally {
            analyzeBtn.disabled = false;
            loadingSpinner.classList.add("hidden");
        }
    });

    searchBtn.addEventListener("click", async () => {
        const query = searchQueryInput.value.trim();
        const rapidapiKey = rapidapiInput.value.trim();

        if (!query) return;

        // UI State
        searchBtn.disabled = true;
        jobError.classList.add("hidden");
        jobLoading.classList.remove("hidden");
        jobsGrid.innerHTML = "";

        try {
            const params = new URLSearchParams({
                query: query,
                rapidapi_key: rapidapiKey
            });

            const response = await fetch(`/api/jobs?${params.toString()}`);

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to fetch jobs");
            }

            const data = await response.json();
            const jobs = data.jobs || [];

            if (jobs.length === 0) {
                showError(jobError, "No jobs found for this query.");
                return;
            }

            jobs.forEach(job => {
                const card = document.createElement("div");
                card.className = "job-card";
                
                const title = job.job_title || "Unknown Title";
                const company = job.employer_name || "Unknown Company";
                const city = job.job_city || "Remote";
                const country = job.job_country || "";
                const type = job.job_employment_type || "N/A";
                const applyLink = job.job_apply_link || "#";

                card.innerHTML = `
                    <div class="job-title">${title}</div>
                    <div class="job-company">🏢 ${company}</div>
                    <div class="job-meta">📍 ${city}, ${country} &nbsp;|&nbsp; ⏱️ ${type}</div>
                    <a href="${applyLink}" target="_blank" class="btn primary-btn">Apply Now ↗</a>
                `;
                jobsGrid.appendChild(card);
            });

        } catch (err) {
            showError(jobError, err.message);
        } finally {
            searchBtn.disabled = false;
            jobLoading.classList.add("hidden");
        }
    });

    function showError(element, message) {
        element.textContent = message;
        element.classList.remove("hidden");
    }
});
