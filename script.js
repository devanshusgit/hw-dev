const STORAGE_KEY = 'hwdev_blog_posts';
const SESSION_KEY = 'hwdev_admin_session';
const CONFIG = window.HWDEV_BACKEND || {
  provider: 'local',
  supabaseUrl: '',
  supabaseAnonKey: '',
  adminUsername: 'admin',
  adminPassword: 'hwdev123'
};

const defaultPosts = [
  {
    id: '1',
    title: 'How to Choose the Right Study Destination in 2026',
    category: 'Destinations',
    author: 'HW Dev Team',
    date: '2026-03-10',
    excerpt: 'A simple framework for comparing countries by cost, career opportunities, visa pathways, and academic fit.',
    content: 'Choosing the right destination means balancing career outcomes, course quality, affordability, work opportunities, and long-term fit. Start with your goals, then compare realistic destinations instead of following trends blindly.'
  },
  {
    id: '2',
    title: 'SOP Tips That Make Your Application Stronger',
    category: 'Applications',
    author: 'HW Dev Team',
    date: '2026-03-08',
    excerpt: 'A better SOP is less about sounding fancy and more about clarity, intent, and evidence.',
    content: 'A strong SOP should explain your background, why this course matters, why this university fits, and what outcome you want after graduation. Avoid clichés and stay specific.'
  },
  {
    id: '3',
    title: 'Visa Preparation Checklist for Study Abroad Students',
    category: 'Visa',
    author: 'HW Dev Team',
    date: '2026-03-05',
    excerpt: 'Documents, financials, timelines, and interview readiness — the essentials in one place.',
    content: 'Visa prep is easier when broken down into timelines, proof of funds, academic records, offer letters, and interview preparation. Keep your documentation organized early.'
  }
];

function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function requireAdmin() {
  if (document.body.innerHTML.includes('Manage blog posts') && !isAdminAuthenticated()) {
    window.location.href = 'admin-login.html';
  }
}

async function getPosts() {
  if (CONFIG.provider === 'supabase' && CONFIG.supabaseUrl && CONFIG.supabaseAnonKey) {
    try {
      const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/posts?select=*`, {
        headers: {
          apikey: CONFIG.supabaseAnonKey,
          Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
        },
      });
      if (res.ok) return await res.json();
    } catch {}
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPosts));
    return defaultPosts;
  }
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPosts));
    return defaultPosts;
  }
}

async function savePosts(posts) {
  if (CONFIG.provider === 'supabase' && CONFIG.supabaseUrl && CONFIG.supabaseAnonKey) {
    return false;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return true;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
}

function postCard(post, full = false) {
  return `
    <article class="info-card blog-card">
      <div class="blog-meta">
        <span class="step-pill">${escapeHtml(post.category)}</span>
        <span>${escapeHtml(post.date)}</span>
      </div>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.excerpt)}</p>
      ${full ? `<div class="blog-content">${escapeHtml(post.content)}</div>` : ''}
      <div class="blog-footer">
        <span>By ${escapeHtml(post.author)}</span>
        <a href="post.html?id=${encodeURIComponent(post.id)}">Read more</a>
      </div>
    </article>
  `;
}

async function renderBlogPreview() {
  const el = document.getElementById('blogPreview');
  if (!el) return;
  const posts = (await getPosts()).slice().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  el.innerHTML = posts.map((post) => postCard(post)).join('');
}

async function renderBlogList(filter = '') {
  const el = document.getElementById('blogGrid');
  if (!el) return;
  const posts = (await getPosts())
    .slice()
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .filter((post) => {
      const q = filter.trim().toLowerCase();
      if (!q) return true;
      return [post.title, post.category, post.excerpt, post.content, post.author].join(' ').toLowerCase().includes(q);
    });
  el.innerHTML = posts.length ? posts.map((post) => postCard(post, true)).join('') : '<div class="info-card"><h2>No posts found</h2><p>Try another search term.</p></div>';
}

async function renderSinglePost() {
  const el = document.getElementById('singlePost');
  if (!el) return;
  const id = new URLSearchParams(window.location.search).get('id');
  const posts = await getPosts();
  const post = posts.find((p) => p.id === id) || posts[0];
  if (!post) {
    el.innerHTML = '<h1>Post not found</h1>';
    return;
  }
  document.title = `${post.title} | HW Dev`;
  el.innerHTML = `
    <div class="blog-meta">
      <span class="step-pill">${escapeHtml(post.category)}</span>
      <span>${escapeHtml(post.date)}</span>
    </div>
    <h1 class="page-title small">${escapeHtml(post.title)}</h1>
    <p class="single-post-excerpt">${escapeHtml(post.excerpt)}</p>
    <div class="blog-content single-post-content">${escapeHtml(post.content)}</div>
    <div class="blog-footer"><span>By ${escapeHtml(post.author)}</span></div>
  `;
}

async function renderAdminList() {
  const list = document.getElementById('adminPostList');
  if (!list) return;
  const posts = (await getPosts()).slice().sort((a,b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = posts.map((post) => `
    <div class="admin-post-item">
      <div>
        <strong>${escapeHtml(post.title)}</strong>
        <p>${escapeHtml(post.category)} • ${escapeHtml(post.date)} • ${escapeHtml(post.author)}</p>
      </div>
      <div class="admin-post-actions">
        <button data-edit="${escapeHtml(post.id)}" class="btn btn-secondary mini-action">Edit</button>
        <button data-delete="${escapeHtml(post.id)}" class="btn btn-primary mini-action">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => fillAdminForm(btn.getAttribute('data-edit')));
  });
  list.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deletePost(btn.getAttribute('data-delete')));
  });
}

async function fillAdminForm(id) {
  const post = (await getPosts()).find((p) => p.id === id);
  if (!post) return;
  document.getElementById('postId').value = post.id;
  document.getElementById('postTitle').value = post.title;
  document.getElementById('postCategory').value = post.category;
  document.getElementById('postAuthor').value = post.author;
  document.getElementById('postDate').value = post.date;
  document.getElementById('postExcerpt').value = post.excerpt;
  document.getElementById('postContent').value = post.content;
}

function resetAdminForm() {
  const form = document.getElementById('blogAdminForm');
  if (form) form.reset();
  const id = document.getElementById('postId');
  if (id) id.value = '';
}

async function deletePost(id) {
  const posts = (await getPosts()).filter((p) => p.id !== id);
  await savePosts(posts);
  await renderAdminList();
  await renderBlogPreview();
  await renderBlogList(document.getElementById('blogSearch')?.value || '');
}

function initAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  const note = document.getElementById('adminLoginNote');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    if (username === CONFIG.adminUsername && password === CONFIG.adminPassword) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      window.location.href = 'admin.html';
    } else if (note) {
      note.textContent = 'Invalid login. Update credentials in backend-config.example.js / script.js before deployment.';
    }
  });
}

function initAdminLogout() {
  const btn = document.getElementById('adminLogoutBtn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'admin-login.html';
  });
}

function initAdmin() {
  const form = document.getElementById('blogAdminForm');
  const resetBtn = document.getElementById('resetPostForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const posts = await getPosts();
    const id = document.getElementById('postId').value || Date.now().toString();
    const post = {
      id,
      title: document.getElementById('postTitle').value,
      category: document.getElementById('postCategory').value,
      author: document.getElementById('postAuthor').value,
      date: document.getElementById('postDate').value,
      excerpt: document.getElementById('postExcerpt').value,
      content: document.getElementById('postContent').value,
    };
    const existingIndex = posts.findIndex((p) => p.id === id);
    if (existingIndex >= 0) posts[existingIndex] = post;
    else posts.push(post);
    await savePosts(posts);
    await renderAdminList();
    await renderBlogPreview();
    await renderBlogList(document.getElementById('blogSearch')?.value || '');
    resetAdminForm();
  });

  if (resetBtn) resetBtn.addEventListener('click', resetAdminForm);
  renderAdminList();
}

function initLeadForm() {
  const form = document.getElementById('leadForm');
  const note = document.getElementById('formNote');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: data.get('name') || '',
      phone: data.get('phone') || '',
      email: data.get('email') || '',
      destination: data.get('destination') || '',
      intake: data.get('intake') || '',
      message: data.get('message') || ''
    };
    const text = `Hi HW Dev, I want to book a consultation.%0A%0AName: ${encodeURIComponent(payload.name)}%0APhone: ${encodeURIComponent(payload.phone)}%0AEmail: ${encodeURIComponent(payload.email)}%0APreferred destination: ${encodeURIComponent(payload.destination)}%0AIntake: ${encodeURIComponent(payload.intake)}%0ARequirements: ${encodeURIComponent(payload.message)}`;
    const whatsappUrl = `https://wa.me/919326213082?text=${text}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (note) note.textContent = 'Opened WhatsApp with your consultation details.';
  });
}

function initSearch() {
  const search = document.getElementById('blogSearch');
  if (!search) return;
  renderBlogList();
  search.addEventListener('input', () => renderBlogList(search.value));
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

requireAdmin();
renderBlogPreview();
renderBlogList();
renderSinglePost();
initAdminLogin();
initAdminLogout();
initAdmin();
initLeadForm();
initSearch();
initReveal();