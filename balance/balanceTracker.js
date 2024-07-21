// Import Firebase functions/methods
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://realtime-database-30537-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(appSettings);
const database = getDatabase(app);
const balanceRef = ref(database, 'currentBalance');

// Reference to the transactions node
const transactionsRef = ref(database, "transactions");

// Function to add a transaction
function addTransaction(date, time, startBal, endBal) {
    const transaction = {
        date: date,
        time: time,
        startBal: startBal,
        endBal: endBal,
    };
    
    push(transactionsRef, transaction)
        .then(() => {
            console.log("Transaction added successfully");
        })
        .catch((error) => {
            console.error("Error adding transaction: ", error);
        });
}

// Function to add a transaction row to the table
// all parameters are strings
function addTransactionRow(date, time, startingBalance, endingBalance) {
    const tableBody = document.querySelector('#transactions-table tbody');

    // Create a new row
    const newRow = document.createElement('tr');

    // Create and append cells to the new row
    const dateCell = document.createElement('td');
    dateCell.textContent = date;
    newRow.appendChild(dateCell);

    const timeCell = document.createElement('td');
    timeCell.textContent = time;
    newRow.appendChild(timeCell);

    const startingBalanceCell = document.createElement('td');
    startingBalanceCell.textContent = startingBalance;
    newRow.appendChild(startingBalanceCell);

    const endingBalanceCell = document.createElement('td');
    endingBalanceCell.textContent = endingBalance;
    newRow.appendChild(endingBalanceCell);

    const differenceCell = document.createElement('td');
    const starting = parseFloat(startingBalance.replace('$', ''));
    const ending = parseFloat(endingBalance.replace('$', ''));
    const difference = ending - starting;
    differenceCell.textContent = `$${difference.toFixed(2)}`;
    newRow.appendChild(differenceCell);

    // Insert the new row at the top of the table body
    if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
    } else {
        tableBody.appendChild(newRow);
    }

    // Update the current balance
    const currBalanceEl = document.querySelector('#current-balance');
    currBalanceEl.innerHTML = "Current Balance: " + endingBalance;
}

// Listen for changes in the transactions node
onValue(transactionsRef, (snapshot) => {
    const transactionsTableBody = document.querySelector('#transactions-table tbody');
    transactionsTableBody.innerHTML = ""; // Clear existing rows

    if (snapshot.exists()) {
        const itemsArray = Object.entries(snapshot.val());
        itemsArray.forEach(([key, transaction]) => {
            addTransactionRow(transaction.date, transaction.time, transaction.startBal, transaction.endBal);
        });
    } else {
        console.log("No transactions found");
    }
});

const addTransactionButton = document.querySelector('#add-transaction-button');
addTransactionButton.addEventListener('click', () => {
    let newBalance = document.querySelector('#input-field').value;
    newBalance = `$${newBalance}`;
    updateBalance(newBalance);
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    const currBalanceEl = document.querySelector('#current-balance');
    const currentBalance = currBalanceEl.innerHTML.replace('Current Balance: ', '').trim();
    
    
    addTransaction(date, time, currentBalance, newBalance);
    document.querySelector('#input-field').value = ""; // Clear the input field
});

function updateBalance(newBalance) {
    set(balanceRef, newBalance);
}