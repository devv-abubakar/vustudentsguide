// script.js

const searchInput = document.getElementById('searchInput');
const grid = document.getElementById('courseGrid');
let allCourses = [];

// Page Load hotay hi data lao
window.onload = async () => {
    // Sirf agar hum Reviews page par hain tab ye chalay
    if(document.getElementById('searchView')) {
        await loadCourses();
        
        // Search Filter Logic
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
        console.log(err);
    }
}

function renderCourses(list) {
    grid.innerHTML = '';
    list.forEach(c => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => loadDetails(c.filename, c.code);
        div.innerHTML = `
            <span style="font-weight:700;">${c.code}</span>
            <span style="color:var(--primary); font-size:0.9rem;">${c.count} Reviews</span>
        `;
        grid.appendChild(div);
    });
}

// Detail View Show Karna
async function loadDetails(filename, code) {
    document.getElementById('searchView').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    
    document.getElementById('courseTitle').innerText = code + " Reviews";
    const list = document.getElementById('reviewsList');
    list.innerHTML = 'Loading...';

    try {
        const res = await fetch(`reviews/${filename}`);
        const data = await res.json();
        list.innerHTML = '';
        
        // Data format check logic
        let reviewsArray = data.reviews || data;

        reviewsArray.forEach(r => {
            const box = document.createElement('div');
            box.className = 'review-box';
            box.innerHTML = `
                <h4 style="margin-bottom:10px;">${r.reviewHeading || 'Review'}</h4>
                <p>${r.reviewText || 'No text'}</p>
            `;
            list.appendChild(box);
        });

    } catch (err) {
        list.innerHTML = 'Error loading reviews.';
    }
}

function goBack() {
    document.getElementById('detailView').classList.add('hidden');
    document.getElementById('searchView').classList.remove('hidden');
}
