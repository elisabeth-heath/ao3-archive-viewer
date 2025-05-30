
async function fetchMetadataFromWayback(url) {
  try {
    const waybackUrl = "https://web.archive.org/web/" + url;
    const res = await fetch(waybackUrl);
    const html = await res.text();

    const titleMatch = html.match(/<h2 class="title heading">\s*(.*?)\s*<\/h2>/);
    const title = titleMatch ? titleMatch[1] : "Unknown Title";

    const authorMatch = html.match(/<a href="\/users\/.*?" class="author">(.+?)<\/a>/);
    const author = authorMatch ? authorMatch[1] : "Unknown Author";

    const summaryMatch = html.match(/<div class="summary">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/);
    const summary = summaryMatch ? summaryMatch[1].replace(/<[^>]+>/g, "") : "No summary.";

    return { url, title, author, summary };
  } catch (err) {
    return { url, title: "Error loading", author: "", summary: "" };
  }
}

function saveToIndexedDB(fics) {
  const dbRequest = indexedDB.open("AO3ArchiveDB", 1);

  dbRequest.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("fics", { keyPath: "url" });
  };

  dbRequest.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("fics", "readwrite");
    const store = tx.objectStore("fics");
    fics.forEach(fic => store.put(fic));
  };
}

function loadFromIndexedDB() {
  const dbRequest = indexedDB.open("AO3ArchiveDB", 1);

  dbRequest.onsuccess = function(event) {
    const db = event.target.result;
    const tx = db.transaction("fics", "readonly");
    const store = tx.objectStore("fics");

    const getAll = store.getAll();
    getAll.onsuccess = function() {
      displayFics(getAll.result);
    };
  };
}

function displayFics(fics) {
  const output = document.getElementById("output");
  output.innerHTML = "";
  fics.forEach(fic => {
    const div = document.createElement("div");
    div.className = "fic";
    div.innerHTML = `
      <h2>${fic.title}</h2>
      <p><strong>Author:</strong> ${fic.author}</p>
      <p><strong>URL:</strong> <a href="${fic.url}" target="_blank">${fic.url}</a></p>
      <p>${fic.summary}</p>
    `;
    output.appendChild(div);
  });
}

document.getElementById("fileInput").addEventListener("change", async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const urls = JSON.parse(text);

  const results = [];
  for (let url of urls) {
    const meta = await fetchMetadataFromWayback(url);
    results.push(meta);
  }

  saveToIndexedDB(results);
  displayFics(results);
});

window.onload = loadFromIndexedDB;
