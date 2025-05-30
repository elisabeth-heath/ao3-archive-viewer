document.getElementById('fileInput').addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const urls = JSON.parse(text);
  const ficList = document.getElementById('ficList');
  const storedFics = JSON.parse(localStorage.getItem('ao3Fics') || '{}');

  for (const url of urls) {
    if (storedFics[url]) {
      renderFic(storedFics[url]);
      continue;
    }

    try {
      const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
      const data = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      const title = doc.querySelector('h2.title')?.textContent.trim() || 'No title found';
      const author = doc.querySelector('a[rel=author]')?.textContent.trim() || 'Unknown author';
      const summary = doc.querySelector('.summary .userstuff')?.textContent.trim() || 'No summary available';
      const statsBlock = doc.querySelector('.stats')?.innerText.trim() || 'No stats';

      const ficData = { url, title, author, summary, stats: statsBlock };
      storedFics[url] = ficData;
      renderFic(ficData);
    } catch (e) {
      console.error('Failed to fetch or parse:', url, e);
    }
  }

  localStorage.setItem('ao3Fics', JSON.stringify(storedFics));
});

function renderFic(fic) {
  const ficCard = document.createElement('div');
  ficCard.className = 'fic-card';
  ficCard.innerHTML = `
    <div class="fic-title"><a href="${fic.url}" target="_blank">${fic.title}</a></div>
    <div class="fic-meta">By ${fic.author}</div>
    <div class="fic-meta">${fic.stats}</div>
    <div>${fic.summary}</div>
  `;
  document.getElementById('ficList').appendChild(ficCard);
}
