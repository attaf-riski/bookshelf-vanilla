const books = [];
const RENDER_EVENT = "render-book";

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function (e) {
  const book = localStorage.getItem(STORAGE_KEY); // masih berupa string
  console.log(book);
});

function generateId() {
  return +new Date();
}

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = Number.parseInt(
    document.getElementById("inputBookYear").value
  );
  const bookComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookComplete
  );
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completeBookshelfList");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) uncompletedBOOKList.append(bookElement);
    else completedBOOKList.append(bookElement);
  }
});

function makeBook(bookObject) {
  const article = document.createElement("article");
  article.classList.add("book_item");

  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  article.appendChild(textTitle);
  article.appendChild(textAuthor);
  article.appendChild(textYear);

  const action = document.createElement("div");
  action.classList.add("action");

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.innerText = "Belum selesai dibaca";
    undoButton.classList.add("green");

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    action.append(undoButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.innerText = "Selesai dibaca";
    checkButton.classList.add("green");

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    action.append(checkButton);
  }

  const trashButton = document.createElement("button");
  trashButton.innerText = "Hapus buku";
  trashButton.classList.add("red");

  trashButton.addEventListener("click", function () {
    removeBook(bookObject.id);
  });

  action.append(trashButton);

  article.appendChild(action);

  return article;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  const bookName = books[bookTarget].title;
  const areYouSure = confirm(
    `Apakah anda yakin ingin menghapus buku ${bookName}?`
  );
  if (areYouSure) {
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");

  function clearForm() {
    document.getElementById("inputBookTitle").value = "";
    document.getElementById("inputBookAuthor").value = "";
    document.getElementById("inputBookYear").value = "";
    document.getElementById("inputBookIsComplete").checked = false;
  }

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    clearForm();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchBook = document.getElementById("searchBook");

  searchBook.addEventListener("submit", function (e) {
    e.preventDefault();
    const searchBook = document.getElementById("searchBookTitle").value;
    const books = document.querySelectorAll(".book_item");

    books.forEach((book) => {
      const bookDesc = book.childNodes[0];
      const bookTitle = bookDesc.firstChild.textContent.toLowerCase();

      if (bookTitle.indexOf(searchBook) != -1) {
        book.setAttribute("style", "display: block;");
      } else {
        book.setAttribute("style", "display: none !important;");
      }
    });
  });
});
