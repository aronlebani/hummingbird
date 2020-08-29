function isBookmark(node) {
  return node.title !== undefined && node.url !== undefined;
}

function isFolder(node) {
  return node.title !== undefined && node.children !== undefined;
}

function flatten(bookmarks, folder, result) {
  const category = { name: folder, files: [] };
  bookmarks.forEach((bookmark) => {
    if (isBookmark(bookmark)) {
      category.files.push({
        name: bookmark.title,
        href: bookmark.url,
      });
    } else if (isFolder(bookmark)) {
      flatten(bookmark.children, bookmark.title, result);
    }
  });
  result.push(category);
}

function render(bookmarks) {
  const rootNode = document.getElementById("root");

  const folderListNode = document.createElement("section");
  folderListNode.id = "base";
  bookmarks.forEach(folder => {
    const folderNode = document.createElement("section");
    folderNode.classList.add("card");
    const header = document.createElement("div");
    header.classList.add("card-header");
    folderNode.appendChild(header);
    const h2 = document.createElement("h2");
    h2.innerText = folder.name;
    header.appendChild(h2);

    const body = document.createElement("div");
    body.classList.add("card-body");
    const fileListNode = document.createElement("ul");
    folder.files.forEach(file => {
      const fileNode = document.createElement("li");
      const linkNode = document.createElement("a");
      linkNode.id = "link"
      linkNode.innerText = file.name;
      linkNode.href = file.href;
      fileNode.appendChild(linkNode);

      fileListNode.appendChild(fileNode);
    });

    body.appendChild(fileListNode);
    folderNode.appendChild(body);
    folderListNode.appendChild(folderNode);
  });

  if (rootNode.childNodes[0]) {
    rootNode.removeChild(rootNode.childNodes[0]);
  }
  rootNode.appendChild(folderListNode);
}

function handleSearch(e) {
  const query = e.target.value;
  const re = new RegExp(query && query.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'), 'i');
  const bookmarks = JSON.parse(JSON.stringify(window.bookmarks)).filter(bookmark => {
    const files = bookmark.files.filter(file => {
      return file.name.search(re) !== -1;
    });
    bookmark.files = files;
    return files.length > 0;
  });
  render(bookmarks);
}

function handleKeyup(e) {
  switch (e.code) {
    case "KeyF":
      document.getElementById("search").focus();
      return;
    case "Escape":
      const tmp = document.createElement("input");
      tmp.id = "tmp"
      document.body.appendChild(tmp);
      tmp.focus();
      document.body.removeChild(tmp);
      return;
  }
}

function handleHelpClick() {
  document.getElementById("dialog").style.display = "block";
}

function handleHelpCloseClick() {
  document.getElementById("dialog").style.display = "none";
}

function main() {
  chrome.bookmarks.getTree(results => {
    let flattened = [];
    flatten(results[0].children, "root", flattened);
    flattened = flattened
      .filter(x => x.name.toLowerCase() != 'ignore')
      .filter(x => x.files.length > 0);
    window.bookmarks = flattened;
    render(window.bookmarks);
  });

  document.getElementById("search").addEventListener("input", handleSearch);
  document.addEventListener("keyup", handleKeyup);
  document.getElementById("help").addEventListener("click", handleHelpClick);
  document.getElementById("close").addEventListener("click", handleHelpCloseClick)
}

window.onload = main;