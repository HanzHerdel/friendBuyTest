var readline = require("readline"),
  dbInterface;
let DB = {};
let transactions = [];
let nestedTransaction = null;
let pointerDB = DB;
const NO_TRANSACTION = "NO TRANSACTION";
// Main
function dataBase() {
  console.log(
    "\n\n------------ In Memory DB ------------\n",
    "DB",
    DB,
    "transactions",
    transactions,
    "pointerDB",
    pointerDB,
    "nestedTransaction",
    nestedTransaction
  );

  if (dbInterface) dbInterface.close();

  dbInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  dbInterface.question(
    "type an instrucction do DB (SET, GET, UNSET, NUMEQUALTO, END, BEGIN, ROLLBACK, COMMIT)\n",
    (input = "") => {
      const splitedInput = input.split(" ");
      switch (splitedInput[0]) {
        case "SET":
          set(splitedInput[1], splitedInput[2]);
          break;

        case "GET":
          get(splitedInput[1]);
          break;

        case "UNSET":
          unset(splitedInput[1]);
          break;

        case "NUMEQUALTO":
          numEqualTo(splitedInput[1]);
          break;

        case "BEGIN":
          beginTransaction();
          break;

        case "ROLLBACK":
          rollBackTransaction();
          break;

        case "COMMIT":
          commitTransaction();
          break;

        case "END":
          process.exit();

        default:
          console.log("Invalid Command");
          dataBase(); /* show menu again if input does not match */
      }
      dataBase();
    }
  );
}

/**
 * initialize a transacction as a empty object to optimize memory
 */
const beginTransaction = () => {
  if (!existTransaction()) nestedTransaction = 0;
  else nestedTransaction++;
  transactions.push({});
  pointerDB = transactions[nestedTransaction];
};

const rollBackTransaction = () => {
  if (!existTransaction()) return console.log(NO_TRANSACTION);
  if (nestedTransaction === 0) {
    clearTransactions();
    return;
  }
  nestedTransaction--;
  pointerDB = transactions[nestedTransaction];
  transactions.pop();
};

const commitTransaction = () => {
  if (!existTransaction()) return console.log(NO_TRANSACTION);
  DB = { ...DB, ...transactions[nestedTransaction] };
  clearTransactions();
};

const clearTransactions = () => {
  transactions = [];
  pointerDB = DB;
  nestedTransaction = null;
};

const set = (name, value) => {
  pointerDB[name] = value;
};

const get = (name) => {
  const value = searchNameInDB(name);
  console.log("Result:", value || "NULL");
};

/**
 * deletes object property if no transaction, if there is, the property will exist as null
 * @param {string} name
 * @returns
 */
const unset = (name) => {
  if (existTransaction()) return (pointerDB[name] = null);
  else delete pointerDB[name];
};

const numEqualTo = (value) => {
  let coincidences;
  if (existTransaction()) {
    coincidences = countValueCoincidences(flatTransactionsToRigth(), value);
  } else {
    coincidences = countValueCoincidences(pointerDB, value);
  }
  return console.log("Coincidences:", coincidences);
};

const countValueCoincidences = (object, value) => {
  return Object.values(object).filter((v) => v == value).length;
};

/**
 * flat current transaction from last to db in order to rewrite existing properties in nested transactions
 */
const flatTransactionsToRigth = () => {
  let righFlaternDB = {};
  let indexDb = transactions.length;
  while (indexDb >= 0) {
    indexDb--;
    righFlaternDB = { ...transactions[indexDb], ...righFlaternDB };
  }
  righFlaternDB = { ...DB, ...righFlaternDB };
  console.log('righFlaternDB: ', righFlaternDB);
  return righFlaternDB;
};

/**
 * search for a property in inverse order to get the last value of an existing property
 * @param {string} name
 * @returns
 */
const searchNameInDB = (name) => {
  let dbWithValue = undefined;
  // if exist transaction search for the last time key exist in db
  if (existTransaction()) {
    let indexDb = transactions.length;
    while (dbWithValue === undefined && indexDb >= 0) {
      indexDb--;
      dbWithValue = transactions[indexDb]?.[name];
    }
  }
  return dbWithValue || DB[name];
};

const existTransaction = () => nestedTransaction !== null;

dataBase();
