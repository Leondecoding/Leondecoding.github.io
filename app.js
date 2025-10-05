document.addEventListener('DOMContentLoaded', ()=>{
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const map = {
    'home':'index.html',
    'ourstory':'our-story.html',
    'blog':'blog.html',
    'original':'original-art.html',
    'prints':'art-prints.html',
    'cards':'greeting-cards.html',
    'contact':'contact.html'
  };
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a=>{
    const isActive = a.getAttribute('href').endswith(path);
    if (isActive) a.classList.add('active');
  });
});
