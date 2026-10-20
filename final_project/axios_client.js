
const {
    getAllBooksAsync,
    getBookByISBNAsync,
    getBooksByAuthorAsync,
    getBooksByTitleAsync
} = require('./router/general.js');

async function main() {
    try {
        console.log('Task 10: Get all books');
        console.log(await getAllBooksAsync());

        console.log('Task 11: Get book by ISBN');
        console.log(await getBookByISBNAsync('1'));

        console.log('Task 12: Get books by author');
        console.log(await getBooksByAuthorAsync('Jane Austen'));

        console.log('Task 13: Get books by title');
        console.log(await getBooksByTitleAsync('Pride and Prejudice'));
    } catch (error) {
        console.error(
            error.response?.data || error.message
        );
        process.exitCode = 1;
    }
}

main();
