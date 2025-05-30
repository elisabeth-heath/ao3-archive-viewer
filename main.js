const ficListDiv = document.getElementById("ficList");
const searchInput = document.getElementById("searchInput");

let allLinks = [];

document.getElementById("jsonInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const text = await file.text();
    const links = JSON.parse(text);
    allLinks.push(...links);
  }
  renderList(allLinks);
});

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = allLinks.filter(link => link.toLowerCase().includes(term));
  renderList(filtered);
});

function renderList(links) {
  ficListDiv.innerHTML = "";
  links.forEach(link => {
    const div = document.createElement("div");
    div.className = "fic-item";
    div.innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
    ficListDiv.appendChild(div);
  });
}
