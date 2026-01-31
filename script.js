// script.js

// 1. Mobile Menu Logic
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// 2. Reviews Page Logic
const searchInput = document.getElementById('searchInput');
const grid = document.getElementById('courseGrid');
let allCourses = [];

window.onload = async () => {
    // Sirf Reviews Page par load karein
    if(document.getElementById('searchView')) {
        await loadCourses();
        
        searchInput.addEventListener('keyup', (e) => {
            const val = e.target.value.toUpperCase();
            const filtered = allCourses.filter(c => c.code.includes(val));
            renderCourses(filtered);
        });
    }
};

async function loadCourses() {
    try {
        const res = await fetch('all_courses.json');
        allCourses = await res.json();
        document.getElementById('loader').style.display = 'none';
        renderCourses(allCourses);
    } catch (err) {
        console.log("Error loading courses");
    }
}

function renderCourses(list) {
    grid.innerHTML = '';
    list.forEach(c => {
        const div = document.createElement('div');
        div.className = 'card';
        // Click karne par Detail View load hoga
        div.onclick = () => loadDetails(c.filename, c.code, c.count);
        div.innerHTML = `
            <span class="card-code">${c.code}</span>
            <span class="card-badge">${c.count} Reviews</span>
        `;
        grid.appendChild(div);
    });
}

// script.js

// ... (Baqi code same rahay ga) ...

// Updated loadDetails Function for Beautiful Cards
async function loadDetails(filename, code, count) {
    document.getElementById('searchView').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    
    // Header
    document.getElementById('detailHeaderTitle').innerText = code;
    document.getElementById('detailHeaderCount').innerText = `${count} Reviews`;
    
    const list = document.getElementById('reviewsList');
    list.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">Loading amazing reviews...</div>';
    window.scrollTo(0,0);

    try {
        const res = await fetch(`reviews/${filename}`);
        const data = await res.json();
        const reviewsArray = data.reviews || data;

        list.innerHTML = '';
        let adCounter = 0;

        reviewsArray.forEach((r, index) => {
            // 1. In-Feed Ad Logic
            adCounter++;
            if(adCounter === 4) {
                const adDiv = document.createElement('div');
                adDiv.className = 'sponsor-box box-feed';
                adDiv.innerText = 'Sponsored Ad';
                list.appendChild(adDiv);
                adCounter = 0;
            }

            // 2. Determine Difficulty Color
            let diffClass = 'diff-medium';
            const diffText = (r.difficulty || 'Medium').toLowerCase();
            if(diffText.includes('easy')) diffClass = 'diff-easy';
            if(diffText.includes('hard') || diffText.includes('tough')) diffClass = 'diff-hard';

            // 3. Create Avatar Initials (Random Letter)
            const firstLetter = r.reviewHeading ? r.reviewHeading.charAt(0) : 'S';

            // 4. Create Card HTML
            const card = document.createElement('div');
            card.className = 'review-card';

            // Topics Logic
            let topicsHtml = '';
            if(r.topicsList && r.topicsList.length > 0) {
                topicsHtml = `<div class="topics-container">
                    ${r.topicsList.map(t => `<span class="topic-pill">#${t}</span>`).join('')}
                </div>`;
            }

            card.innerHTML = `
                <div class="review-header-row">
                    <div class="user-info">
                        <div class="avatar">${firstLetter}</div>
                        <div class="user-meta">
                            <h4>Student Review #${index + 1}</h4>
                            <span>Verified Student</span>
                        </div>
                    </div>
                    <span class="badge-difficulty ${diffClass}">${r.difficulty || 'General'}</span>
                </div>

                <div class="review-content">
                    <strong style="display:block; margin-bottom:10px; color:#0f172a;">${r.reviewHeading}</strong>
                    ${r.reviewText}
                </div>

                ${topicsHtml}
            `;
            list.appendChild(card);
        });

    } catch (err) {
        list.innerHTML = '<p style="text-align:center; color:red">Error loading reviews.</p>';
    }
}

function goBack() {
    document.getElementById('detailView').classList.add('hidden');
    document.getElementById('searchView').classList.remove('hidden');
    window.scrollTo(0,0);
}
