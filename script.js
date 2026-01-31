// script.js

// 1. Mobile Menu Toggle
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('active');
}

// 2. Reviews Page Logic
const searchView = document.getElementById('searchView');
const detailView = document.getElementById('detailView');
const grid = document.getElementById('courseGrid');
const loader = document.getElementById('loader');

let allCourses = [];

// Page Load Event
document.addEventListener('DOMContentLoaded', async () => {
    
    // Check if we are on Reviews Page
    if(searchView) {
        await loadCourses();

        // Search Filter Logic
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            const val = e.target.value.toUpperCase().trim();
            const filtered = allCourses.filter(c => c.code.includes(val));
            renderCourses(filtered);
        });
    }
});

// Load Courses from JSON
async function loadCourses() {
    try {
        // NOTE: Ensure you have a valid 'all_courses.json' file
        // Format: [{"code": "CS101", "count": 50, "filename": "cs101.json"}, ...]
        const res = await fetch('all_courses.json');
        if(!res.ok) throw new Error("File not found");
        
        allCourses = await res.json();
        if(loader) loader.style.display = 'none';
        renderCourses(allCourses);
    } catch (err) {
        console.error(err);
        if(loader) loader.innerText = "Error loading courses. Please try again.";
    }
}

// Render Grid
function renderCourses(list) {
    if(!grid) return;
    grid.innerHTML = '';
    
    if(list.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No courses found.</p>';
        return;
    }

    list.forEach(c => {
        const div = document.createElement('div');
        div.className = 'course-card';
        // Open Detail View on Click
        div.onclick = () => showDetails(c);
        div.innerHTML = `
            <span class="course-code">${c.code}</span>
            <span class="review-count">${c.count} Reviews</span>
        `;
        grid.appendChild(div);
    });
}

// Show Review Details (Optimized Navigation)
async function showDetails(course) {
    searchView.classList.add('hidden'); // Hide Search
    detailView.classList.remove('hidden'); // Show Details
    detailView.style.display = 'block'; // Ensure block display
    searchView.style.display = 'none';
    
    window.scrollTo(0,0); // Scroll to top

    // Update Header
    document.getElementById('detailHeaderTitle').innerText = course.code;
    
    const list = document.getElementById('reviewsList');
    list.innerHTML = '<div style="text-align:center; padding:40px;">Loading...</div>';

    try {
        const res = await fetch(`reviews/${course.filename}`);
        const data = await res.json();
        const reviews = data.reviews || data;
        
        list.innerHTML = '';
        
        reviews.forEach((r, i) => {
            // Difficulty Badge Logic
            let badgeClass = 'medium';
            const diff = (r.difficulty || 'Medium').toLowerCase();
            if(diff.includes('easy')) badgeClass = 'easy';
            if(diff.includes('hard')) badgeClass = 'hard';

            // Create Card
            const card = document.createElement('div');
            card.className = 'review-detail-card';
            card.innerHTML = `
                <div class="review-header">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div class="user-avatar">${r.reviewHeading ? r.reviewHeading.charAt(0) : 'S'}</div>
                        <div>
                            <h4 style="margin:0; color:var(--secondary);">Student Review</h4>
                            <small style="color:var(--text-light);">Verified User</small>
                        </div>
                    </div>
                    <span class="badge ${badgeClass}">${r.difficulty || 'General'}</span>
                </div>
                <div class="review-body">
                    <strong>${r.reviewHeading}</strong><br><br>
                    ${r.reviewText}
                </div>
            `;
            list.appendChild(card);

            // Insert Ad after every 3 reviews (Optional)
            if((i + 1) % 3 === 0) {
                const ad = document.createElement('div');
                ad.className = 'ad-slot ad-feed';
                ad.innerText = 'Sponsored Ad';
                list.appendChild(ad);
            }
        });

    } catch (err) {
        list.innerHTML = '<p style="color:red; text-align:center;">Reviews not available yet.</p>';
    }
}

// Back Button Logic
function goBack() {
    detailView.style.display = 'none';
    searchView.style.display = 'block';
    window.scrollTo(0,0);
}
