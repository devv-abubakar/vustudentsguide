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
    const searchView = document.getElementById('searchView');
    const detailView = document.getElementById('detailView');
    
    // Switch Views
    searchView.style.display = 'none';
    detailView.style.display = 'block';
    
    window.scrollTo(0,0);

    // Update Header Title
    document.getElementById('detailHeaderTitle').innerText = `${course.code} Reviews`;
    
    const list = document.getElementById('reviewsList');
    list.innerHTML = '<div style="text-align:center; padding:50px;">Loading Reviews...</div>';

    try {
        const res = await fetch(`reviews/${course.filename}`);
        const data = await res.json();
        const reviews = data.reviews || data;
        
        list.innerHTML = '';
        
        if(reviews.length === 0) {
            list.innerHTML = '<p style="text-align:center;">No reviews found.</p>';
            return;
        }

        reviews.forEach((r, i) => {
            // 1. Determine Difficulty Style
            let badgeClass = 'badge-medium';
            let cardBorderClass = 'diff-medium';
            
            // Safe check for difficulty text
            const diffText = (r.difficulty || 'Medium').toLowerCase();
            
            if(diffText.includes('easy')) {
                badgeClass = 'badge-easy';
                cardBorderClass = 'diff-easy';
            } 
            else if(diffText.includes('hard') || diffText.includes('tough')) {
                badgeClass = 'badge-hard';
                cardBorderClass = 'diff-hard';
            }

            // 2. Avatar Letter
            const initial = r.reviewHeading ? r.reviewHeading.charAt(0).toUpperCase() : 'S';

            // 3. Create Element
            const card = document.createElement('div');
            // Adding dynamic class for border color
            card.className = `review-detail-card ${cardBorderClass}`; 

            card.innerHTML = `
                <div class="review-header">
                    <div class="user-profile">
                        <div class="avatar-circle">${initial}</div>
                        <div>
                            <h4 style="margin:0; color:var(--secondary); font-size:1.1rem;">Student Review #${i + 1}</h4>
                            <small style="color:var(--text-light);">Verified Submission</small>
                        </div>
                    </div>
                    <span class="badge ${badgeClass}">${r.difficulty || 'Medium'}</span>
                </div>

                <div class="review-content-area">
                    <strong class="review-heading-text">${r.reviewHeading}</strong>
                    <div class="review-body-text">${r.reviewText}</div>
                </div>
            `;
            
            list.appendChild(card);

            // 4. Inject Ad after every 3rd review
            if((i + 1) % 3 === 0) {
                const ad = document.createElement('div');
                ad.className = 'ad-slot ad-feed';
                ad.innerText = 'Sponsored Ad';
                list.appendChild(ad);
            }
        });

    } catch (err) {
        console.error(err);
        list.innerHTML = '<div style="text-align:center; color:red; padding:20px;">Error loading reviews. Please try again later.</div>';
    }
}

// Back Button Logic
function goBack() {
    detailView.style.display = 'none';
    searchView.style.display = 'block';
    window.scrollTo(0,0);
}
