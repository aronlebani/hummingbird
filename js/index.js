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

function renderBookmarks(bookmarks) {
  const rootNode = document.getElementById("bookmarks");
  
  const flattened = [];
  flatten(bookmarks[0].children, "root", flattened);

  const folderListNode = document.createElement("ul");
  flattened.forEach(folder => {
    const folderNode = document.createElement("li");
    folderNode.innerText = folder.name;

    const fileListNode = document.createElement("ul");
    folder.files.forEach(file => {
      const fileNode = document.createElement("li");
      fileNode.innerText = file.name;

      fileListNode.appendChild(fileNode);
    });

    folderNode.appendChild(fileListNode);
    folderListNode.appendChild(folderNode);
  });

  rootNode.appendChild(folderListNode);
}

chrome.bookmarks.getTree(renderBookmarks);