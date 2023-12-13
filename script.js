"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  // Math.floor() does type coercion, convert string to number
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/////////////////////////////////////////////////
// Converting and Checking Numbers
/*
console.log(23 === 23.0); // true

// Base 10 - 0 to 9. 1/10 = 0.1. 3/10 = 3.3333333
// Binary base 2 - 0 1
console.log(0.1 + 0.2); // 0.300000000000004
console.log(0.1 + 0.2 === 0.3); // false

// Conversion
console.log(Number("23")); // 23
console.log(+"23"); // 23 -> Coercion

// Parsing
console.log(Number.parseInt("30px", 10)); // 30
console.log(Number.parseInt("e23", 10)); // NaN

console.log(Number.parseInt("  2.5rem  ")); // 2
console.log(Number.parseFloat("  2.5rem  ")); // 2.5

// console.log(parseFloat("  2.5rem  ")); // 2.5

// Check if a value is NaN
console.log(Number.isNaN(20)); // false
console.log(Number.isNaN("20")); // false
console.log(Number.isNaN(+"20X")); // true -> NaN
console.log(Number.isNaN(23 / 0)); // false

// Checking if value is number
console.log(Number.isFinite(20)); // true -> 20
console.log(Number.isFinite("20")); // false
console.log(Number.isFinite(+"20X")); // false
console.log(Number.isFinite(23 / 0)); // false

console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(23 / 0)); // false


/////////////////////////////////////////////////
// Math and Rounding

console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // 5
console.log(8 ** (1 / 3)); // 2

console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, "23", 11, 2)); // 23
console.log(Math.max(5, 18, "23px", 11, 2)); // NaN

console.log(Math.min(5, 18, 23, 11, 2)); // 2

console.log(Math.PI * Number.parseFloat("10px") ** 2); // 314.1592653589793

console.log(Math.trunc(Math.random() * 6) + 1); // 1 - 6

// Random number between a range
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min...max
console.log(randomInt(10, 20)); // 10 - 20

// Rounding integers
console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); // 24

console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9)); // 24

console.log(Math.floor(23.3)); // 23
console.log(Math.floor("23.9")); // 23

console.log(Math.trunc(23.3)); // 23

console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // -24

// Rounding decimals
console.log((2.7).toFixed(0)); // "3"
console.log((2.7).toFixed(3)); // "2.700"
console.log((2.345).toFixed(2)); // "2.35"
console.log(+(2.345).toFixed(2)); // 2.35


/////////////////////////////////////////////////
// The Remainder Operator

console.log(5 % 2); // 1
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3); // 2
console.log(8 / 3); // 8 = 2 * 3 + 2

console.log(6 % 2); // 0
console.log(6 / 2); // 3

console.log(7 % 2); // 1
console.log(7 / 2); // 3.5

const isEven = (n) => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener("click", function () {
  [...document.querySelectorAll(".movements__row")].forEach(function (row, i) {
    // 0, 2, 4, 6
    if (i % 2 === 0) row.style.backgroundColor = "orangered";
    // 1, 3, 5, 7
    if (i % 2 !== 0) row.style.backgroundColor = "blue";
  });
});


/////////////////////////////////////////////////
// NUMERIC Separators

// 287,460,000,000
const diameter = 287_460_000_000; // thousands
console.log(diameter);

const price = 345_99; // cents
console.log(price);

const transferFee1 = 15_00; // cents
const transferFee2 = 1_500; // thousands

// const PI = 3._1415; // Uncaught SyntaxError: Invalid or unexpected token
console.log(PI);

console.log(Number("230000")); // 230000
console.log(Number("230_000")); // NaN -> Fail
console.log(parseInt("230_000")); // 230 -> Wrong number


/////////////////////////////////////////////////
// Working with BigInt

console.log(2 ** 53 - 1); // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(2 ** 53 + 1); // 9007199254740992 -> Wrong number
console.log(2 ** 53 + 2); // 9007199254740994 -> Correct number
console.log(2 ** 53 + 3); // 9007199254740996 -> Wrong number
console.log(2 ** 53 + 4); // 9007199254740996 -> Correct number

// Two ways to build BigInt numbers
console.log(4838430248342043823408394839483204n); // 4838430248342043823408394839483204n -> BigInt
console.log(BigInt(48384302)); // 48384302n -> BigInt

// Operations -> all operands have to be BigInt
console.log(10000n + 10000n); // 20000n
console.log(36286372637263726376237263726372632n * 10000000n); // 362863726372637263762372637263726320000000n
// console.log(Math.sqrt(16n)); // Uncaught TypeError: Cannot convert a BigInt value to a number

const huge = 20289830237283728378237n;
const num = 23;
// console.log(huge * num); // Uncaught TypeError: Cannot mix BigInt and other types, use explicit conversions
console.log(huge * BigInt(num)); // 466666095457525752699451n

// Exceptions -> conditional operators and + (concatenation), operands can be different
console.log(20n > 15); // true
console.log(20n === 20); // false
console.log(typeof 20n); // bigint
console.log(20n == "20"); // true

console.log(huge + " is REALLY big!!!"); // 20289830237283728378237 is REALLY big!!!

// Divisions
console.log(11n / 3n); // 3n
console.log(10 / 3); // 3.3333333333333335
*/

/////////////////////////////////////////////////
// Creating Dates

// Create a date
/*
const now = new Date();
console.log(now); // Tue Dec 12 2023 20:47:34 GMT-0600 (Central Standard Time)

console.log(new Date("Dec 12 2023 20:47:34")); // Tue Dec 12 2023 20:47:34 GMT-0600 (Central Standard Time)
console.log(new Date("December 24, 2015")); // Thu Dec 24 2015 00:00:00 GMT-0600 (Central Standard Time)
console.log(new Date(account1.movementsDates[0])); // Mon Nov 18 2019 15:31:17 GMT-0600 (Central Standard Time)

console.log(new Date(2037, 10, 19, 15, 23, 5)); // Thu Nov 19 2037 15:23:05 GMT-0600 (Central Standard Time)
console.log(new Date(2037, 10, 31)); // Tue Dec 01 2037 00:00:00 GMT-0600 (Central Standard Time)

console.log(new Date(0)); // Wed Dec 31 1969 18:00:00 GMT-0600 (Central Standard Time)
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sat Jan 03 1970 18:00:00 GMT-0600 (Central Standard Time)
*/

// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future); // Thu Nov 19 2037 15:23:00
console.log(future.getFullYear()); // 2037
console.log(future.getMonth()); // 10
console.log(future.getDate()); // 19
console.log(future.getDay()); // 4 -> Thu
console.log(future.getHours()); // 15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 0
console.log(future.toISOString()); // 2037-11-19T21:23:00.000Z
console.log(future.getTime()); // 2142278580000 -> timestamp

console.log(new Date(2142278580000)); // Thu Nov 19 2037 15:23:00 GMT-0600 (Central Standard Time)

console.log(Date.now()); // 1702479372000 -> timestamp

future.setFullYear(2040);
console.log(future); // Mon Nov 19 2040 15:23:00 GMT-0600 (Central Standard Time)
