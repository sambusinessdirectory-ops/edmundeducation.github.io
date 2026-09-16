document.addEventListener('click', event => {
 const book = event.target.closest('[data-purpose-book]'); if (!book) return;
 const dialog = document.createElement('dialog'); dialog.className = 'purpose-book-dialog';
 const title = document.createElement('h2'); title.textContent = book.dataset.purposeBook;
 const empty = document.createElement('p'); empty.textContent = '內容準備中 · This book is empty for now.';
 const close = document.createElement('button'); close.type = 'button'; close.textContent = '關閉'; close.onclick = () => dialog.close();
 dialog.append(title, empty, close); document.body.append(dialog);
 dialog.addEventListener('close', () => { dialog.remove(); book.focus(); }, {once:true}); dialog.showModal();
});
