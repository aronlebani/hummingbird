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
    folderNode.id = "card";
    const h2 = document.createElement("h2");
    h2.innerText = '#' + folder.name;
    folderNode.appendChild(h2);

    const fileListNode = document.createElement("ul");
    folder.files.forEach(file => {
      const fileNode = document.createElement("li");
      const linkNode = document.createElement("a");
      linkNode.id = "link"
      linkNode.innerText = file.name;
      linkNode.href = file.href;
      linkNode.target = '_blank';
      fileNode.appendChild(linkNode);

      fileListNode.appendChild(fileNode);
    });

    folderNode.appendChild(fileListNode);
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

function main() {
  chrome.bookmarks.getTree(results => {
    const flattened = [];
    flatten(results[0].children, "root", flattened);
    console.log("--flattened", flattened)
    window.bookmarks = flattened;
    render(window.bookmarks.filter(bookmark => bookmark.files.length > 0));
  });

  document.getElementById("search").addEventListener("input", handleSearch);
}

window.onload = main;