// Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Authentication
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    // --- DOM Elements ---
    const resumeListSection = document.getElementById("resumeListSection");
    const resumeEditorSection = document.getElementById("resumeEditorSection");
    const resumeListContainer = document.getElementById("resumeListContainer");
    const createResumeBtn = document.getElementById("createResumeBtn");
    const backToDashboardBtn = document.getElementById("backToDashboardBtn");
    const cvForm = document.getElementById("cvForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const templateCards = document.querySelectorAll('.template-card');
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    // --- State ---
    let templates = document.querySelectorAll('.template-card');

    // --- Dashboard Dark Mode ---
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
        // Check saved preference
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeBtn.textContent = '☀️ Light Mode';
        }

        darkModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            darkModeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // --- Initial Load ---
    renderResumes();

    // --- Event Listeners ---

    // Search Input (Real-time)
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderResumes();
        });
    }

    // Search Button (Manual Trigger)
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderResumes();
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Logout',
                text: "Are you sure you want to logout?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#282354',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout!',
                
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("currentUser");
                    window.location.href = "index.html";
                }
            });
        });
    }

    // Toggle: Create New Resume
    createResumeBtn.addEventListener('click', () => {
        showEditor();
        cvForm.reset(); // Clear form
        document.getElementById('resumeId').value = ""; // Clear ID

        // Pre-fill email/name from currentUser if available
        document.getElementById('email').value = currentUser.email || "";
        document.getElementById('fullName').value = currentUser.name || "";
    });

    // Toggle: Back to Dashboard
    backToDashboardBtn.addEventListener('click', () => {
        showList();
        renderResumes();
    });

    // Template Selection
    templates.forEach(card => {
        card.addEventListener('click', () => {
            templates.forEach(t => t.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Form Submission (Save & Generate)
    cvForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveAndGenerateCV();
    });


    // --- Functions ---

    function showList() {
        resumeListSection.classList.remove("d-none");
        resumeEditorSection.classList.add("d-none");
    }

    function showEditor() {
        resumeListSection.classList.add("d-none");
        resumeEditorSection.classList.remove("d-none");
    }

    function renderResumes() {
        // Get all resumes
        const allResumes = JSON.parse(localStorage.getItem("resumes")) || [];
        // Filter for current user
        let userResumes = allResumes.filter(r => r.userEmail === currentUser.email);

        // Filter by Search Query
        const searchInputEl = document.getElementById("searchInput");
        if (searchInputEl && searchInputEl.value.trim() !== "") {
            const query = searchInputEl.value.toLowerCase().trim();
            userResumes = userResumes.filter(r => {
                const title = (r.jobTitle || "").toLowerCase();
                const name = (r.fullName || "").toLowerCase();
                const skills = (r.skills || "").toLowerCase();
                return title.includes(query) || name.includes(query) || skills.includes(query);
            });
        }

        resumeListContainer.innerHTML = "";

        if (userResumes.length === 0) {
            resumeListContainer.innerHTML = `
                <div class="col-12 text-center text-muted mt-5">
                    <h4>No resumes found.</h4>
                    <p>Click "Create New Resume" to get started.</p>
                </div>
            `;
            return;
        }

        userResumes.forEach(resume => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";
            card.innerHTML = `
                <div class="card shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title">${resume.jobTitle || "Untitled Resume"}</h5>
                        <p class="card-text text-muted">${resume.fullName}</p>
                        <p class="card-text small">Updated: ${new Date(resume.updatedAt).toLocaleDateString()}</p>
                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-sm btn-outline-primary w-100" onclick="editResume('${resume.id}')">Edit</button>
                            <button class="btn btn-sm btn-outline-danger w-100" onclick="deleteResume('${resume.id}')">Delete</button>
                        </div>
                         <button class="btn btn-sm btn-theme w-100 mt-2" onclick="previewResume('${resume.id}')">Preview / Print</button>
                    </div>
                </div>
            `;
            resumeListContainer.appendChild(card);
        });
    }

    window.editResume = function (id) {
        const allResumes = JSON.parse(localStorage.getItem("resumes")) || [];
        const resume = allResumes.find(r => r.id === id);

        if (resume) {
            showEditor();

            // Fill form
            document.getElementById('resumeId').value = resume.id;
            document.getElementById('fullName').value = resume.fullName || "";
            document.getElementById('email').value = resume.email || "";
            document.getElementById('phone').value = resume.phone || "";
            document.getElementById('degree').value = resume.degree || "";
            document.getElementById('university').value = resume.university || "";
            document.getElementById('jobTitle').value = resume.jobTitle || "";
            document.getElementById('company').value = resume.company || "";
            document.getElementById('skills').value = resume.skills || "";
            document.getElementById('languages').value = resume.languages || "";
            document.getElementById('summary').value = resume.summary || "";

            // Select Template
            templates.forEach(t => t.classList.remove('selected'));
            const templateCard = document.querySelector(`.template-card[data-template="${resume.template}"]`);
            if (templateCard) templateCard.classList.add('selected');
        }
    };

    window.deleteResume = function (id) {
        Swal.fire({
            title: 'Delete Resume',
            text: "Are you sure you want to delete this resume?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                let allResumes = JSON.parse(localStorage.getItem("resumes")) || [];
                allResumes = allResumes.filter(r => r.id !== id);
                localStorage.setItem("resumes", JSON.stringify(allResumes));
                renderResumes();
                Swal.fire('Deleted!', 'Your resume has been deleted.', 'success');
            }
        });
    };

    window.previewResume = function (id) {
        const allResumes = JSON.parse(localStorage.getItem("resumes")) || [];
        const resume = allResumes.find(r => r.id === id);
        if (resume) {
            generateAndOpenCV(resume, resume.template);
        }
    };

    function saveAndGenerateCV() {
        const formData = new FormData(cvForm);
        const data = Object.fromEntries(formData.entries());

        // Get selected template
        const selectedCard = document.querySelector('.template-card.selected');
        const templateName = selectedCard ? selectedCard.getAttribute('data-template') : 'modern';

        // Prepare object to save
        const savedResume = {
            ...data,
            id: data.id || 'res-' + Date.now(),
            userEmail: currentUser.email,
            template: templateName,
            updatedAt: new Date().toISOString()
        };

        // Save to Local Storage
        let allResumes = JSON.parse(localStorage.getItem("resumes")) || [];

        if (data.id) {
            // Update existing
            const index = allResumes.findIndex(r => r.id === data.id);
            if (index !== -1) allResumes[index] = savedResume;
        } else {
            // Create new
            allResumes.push(savedResume);
        }

        localStorage.setItem("resumes", JSON.stringify(allResumes));

        // Generate and Open
        generateAndOpenCV(savedResume, templateName);

        // Return to list view
        showList();
        renderResumes();
    }
});

/**
 * Generates the HTML string for the CV and opens it
 */
function generateAndOpenCV(data, templateName) {
    // Normalize template name references for switch logic if needed,
    // but here we use simple class/style changes.
    // Capitalize for display logic if used in titles
    const displayTemplateName = templateName.charAt(0).toUpperCase() + templateName.slice(1);

    const cvHTML = generateCVHTML(data, displayTemplateName);

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(cvHTML);
        win.document.close();
    } else {
        Swal.fire('Blocked!', 'Please allow popups to view the generated CV.', 'error');
    }
}

function generateCVHTML(data, templateName) {
    let styles = '';
    const commonStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.5;
            background: #f0f2f5;
        }
        .action-bar {
            position: fixed; top: 0; left: 0; width: 100%;
            background: #282354; color: white;
            padding: 0 40px; height: 70px;
            display: flex; align-items: center; justify-content: space-between;
            z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
        }
        .action-bar .brand { font-size: 1.4rem; font-weight: 700; }
        .action-bar .actions { display: flex; gap: 12px; }
        .action-bar button {
            padding: 8px 14px; border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px; cursor: pointer; font-size: 0.9rem;
            background: transparent; color: white; transition: 0.2s;
        }
        .action-bar button:hover { background: rgba(255,255,255,0.1); border-color: white; }
        .action-bar button.save-btn { background: #28a745; border: none; }
        .action-bar button.save-btn:hover { background: #218838; }

        body { padding-top: 70px; }
        .cv-container {
            background: white;
            box-shadow: 0 0 40px rgba(0,0,0,0.1);
            margin: 30px auto;
            overflow: hidden;
            width: 210mm; /* A4 Width */
            min-height: 297mm; /* A4 Height */
        }
        .editable:hover { background: rgba(0,0,0,0.02); cursor: pointer; border-radius: 4px; }

        .section-title {
            font-weight: 700; text-transform: uppercase;
            letter-spacing: 1.5px; border-bottom: 2px solid #eee;
            padding-bottom: 8px; margin-bottom: 15px;
        }

        /* Dark Mode */
        body.dark-mode { background: #121212; color: #e0e0e0; }
        body.dark-mode .cv-container { background: #1e1e1e; color: #e0e0e0; box-shadow: none; }
        body.dark-mode .section-title { border-color: #444; color: #5dade2; }

        @media print {
            .no-print { display: none !important; }
            body { padding-top: 0; background: white; }
            .cv-container { margin: 0; box-shadow: none; width: 100%; }
        }
    `;

    if (templateName === 'Professional') {
        styles = `
            ${commonStyles}
            .cv-container { display: flex; }
            .sidebar {
                width: 35%; background: #2c3e50; color: white;
                padding: 50px 35px; box-sizing: border-box;
            }
            .main-content {
                width: 65%; padding: 60px 50px; box-sizing: border-box;
            }
            .sidebar .section-title { color: #5dade2; border-color: rgba(255,255,255,0.1); font-size: 1.1rem; }
            .sidebar .contact-info p { font-size: 0.9rem; margin: 8px 0; opacity: 0.9; }
            .header h1 { font-size: 3rem; margin: 0; color: #2c3e50; font-weight: 800; }
            .header .job-title { font-size: 1.25rem; color: #3498db; font-weight: 500; margin-top: 4px; }
            .sidebar p, .sidebar h3 { font-size: 0.95rem; margin-top: 0; }
            .item h3 { margin-bottom: 4px; font-weight: 700; }
            .item .meta { font-style: italic; color: #7f8c8d; margin-bottom: 10px; font-size: 0.9rem; }
            .skills-pills { display: flex; flex-wrap: wrap; gap: 8px; }
            .pill { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; }
        `;
    } else if (templateName === 'Modern') {
        styles = `
            ${commonStyles}
            .cv-container { padding: 0; }
            .header { background: #2c3e50; color: white; padding: 60px 50px; text-align: center; }
            .header h1 { font-size: 3.5rem; margin: 0; }
            .content-wrapper { padding: 50px; }
            .section-title { color: #3498db; border-color: #3498db; }
        `;
    } else if (templateName === 'Minimalist') {
        styles = `
            ${commonStyles}
            .cv-container { padding: 80px 100px; max-width: 800px; box-shadow: none; border: 1px solid #eee; }
            .header { border-bottom: 2px solid #333; margin-bottom: 40px; padding-bottom: 20px; }
            .section-title { border: none; font-size: 1.2rem; text-decoration: underline; margin-bottom: 20px; }
        `;
    } else {
        // Creative / Default
        styles = `
            ${commonStyles}
            .cv-container { padding: 0; border-top: 15px solid #e74c3c; }
            .header { padding: 60px 50px; border-bottom: 1px solid #eee; }
            .header h1 { color: #e74c3c; font-size: 3rem; }
            .content-wrapper { padding: 50px; }
            .section-title { background: #e74c3c; color: white; padding: 5px 15px; border-radius: 0 20px 20px 0; border: none; display: inline-block; }
        `;
    }

    const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()) : [];

    let cvLayout = '';
    if (templateName === 'Professional') {
        cvLayout = `
            <div class="sidebar">
                <div class="section">
                    <div class="section-title">Contact</div>
                    <div class="contact-info">
                        <p class="editable">📧 ${data.email || 'email@example.com'}</p>
                        <p class="editable">📱 ${data.phone || 'Phone Number'}</p>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Education</div>
                    <div class="item">
                        <h3 class="editable">${data.degree || 'Your Degree'}</h3>
                        <p class="editable">${data.university || 'University Name'}</p>
                    </div>
                </div>

                ${skillsArray.length > 0 ? `
                <div class="section">
                    <div class="section-title">Skills</div>
                    <div class="skills-pills">
                        ${skillsArray.map(s => `<span class="pill">${s}</span>`).join('')}
                    </div>
                </div>` : ''}
            </div>
            <div class="main-content">
                <div class="header">
                    <h1 class="editable">${data.fullName || 'YOUR NAME'}</h1>
                    <div class="job-title editable">${data.jobTitle || 'Business Professional'}</div>
                </div>

                ${data.summary ? `
                <div class="section" style="margin-top: 40px;">
                    <div class="section-title">Professional Profile</div>
                    <p class="editable" style="font-size: 1.05rem;">${data.summary}</p>
                </div>` : ''}

                <div class="section">
                    <div class="section-title">Work Experience</div>
                    <div class="item">
                        <h3 class="editable">${data.jobTitle || 'Role Name'}</h3>
                        <div class="meta editable">${data.company || 'Company Name'} | Present</div>
                        <p class="editable">Key responsibilities and achievements in this role.</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        cvLayout = `
            <div class="header">
                <h1 class="editable">${data.fullName || 'YOUR NAME'}</h1>
                <div class="job-title editable">${data.jobTitle || 'Software Engineer'}</div>
                <div class="contact-info" style="display: flex; gap: 20px; margin-top: 15px;">
                    <span>📧 ${data.email}</span>
                    <span>📱 ${data.phone}</span>
                </div>
            </div>
            <div class="content-wrapper">
                ${data.summary ? `
                <div class="section">
                    <div class="section-title">Profile</div>
                    <p class="editable">${data.summary}</p>
                </div>` : ''}

                <div class="section">
                    <div class="section-title">Experience</div>
                    <div class="item">
                        <h3 class="editable">${data.jobTitle}</h3>
                        <p class="editable" style="color: #3498db; font-weight: 600;">${data.company}</p>
                        <p class="editable">Key achievements and core responsibilities.</p>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Education</div>
                    <div class="item">
                        <h3 class="editable">${data.degree}</h3>
                        <p class="editable">${data.university}</p>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Technical Skills</div>
                    <p class="editable">${data.skills}</p>
                </div>
            </div>
        `;
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${data.fullName} - Resume</title>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <style>${styles}</style>
        </head>
        <body>
            <div class="action-bar no-print">
                <div class="brand">CV Maker</div>
                <div class="actions">
                    <button onclick="window.close()">⬅️ Exit</button>
                    <button onclick="toggleDarkMode()">🌙 Theme</button>
                    <button onclick="logout()">Logout</button>
                    <button onclick="toggleEditMode()" id="editBtn">✏️ Edit Mode</button>
                    <button class="save-btn" onclick="window.print()">💾 Save / Print</button>
                </div>
            </div>

            <div class="cv-container" id="cvContent">
                ${cvLayout}
            </div>

            <script>
                function toggleDarkMode() {
                    document.body.classList.toggle('dark-mode');
                }
                function toggleEditMode() {
                    const isEdit = document.body.contentEditable === 'true';
                    document.body.contentEditable = !isEdit;
                    const btn = document.getElementById('editBtn');
                    btn.textContent = !isEdit ? '✅ Finish' : '✏️ Edit Mode';
                    btn.style.background = !isEdit ? '#e74c3c' : 'transparent';
                    if(!isEdit) {
                        Swal.fire({
                            title: 'Edit Mode Enabled',
                            text: 'You can now click on any text to edit it!',
                            icon: 'info',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                }
                function logout() {
                    Swal.fire({
                        title: 'Logout',
                        text: "Are you sure you want to logout?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#282354',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, logout!'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            localStorage.removeItem("currentUser");
                            if (window.opener) {
                                window.opener.location.href = "index.html"; 
                            }
                            window.close();
                        }
                    });
                }
            </script>
        </body>
        </html>
    `;
}
