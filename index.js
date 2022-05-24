var readline = require('readline'),
    dbInterface;
let DB={X:1}
let transactions=[];
let nestedTransaction=null;
let pointerDB=DB;
// Main
function dataBase() {
    console.log(
        '\n\n------------ In Memory DB ------------\n',
        'DB',DB,
        'transactions',transactions,
        'pointerDB', pointerDB,
        nestedTransaction
        );

    if(dbInterface) dbInterface.close();

    dbInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    dbInterface.question('type an instrucction do DB (SET, GET, UNSET, NUMEQUALTO, END, BEGIN,ROLLBACK, COMMIT)\n', (input="")=> {
        const splitedInput=input.split(" ")
        switch(splitedInput[0]) {
            case 'SET': set(splitedInput[1],splitedInput[2]); break;
            
            case 'GET': get(splitedInput[1]); break;
            
            case 'UNSET': unset(splitedInput[1],); break;
            
            case 'NUMEQUALTO': numEqualTo(splitedInput[1]); break;

            case 'BEGIN' : beginTransaction(); break;

            case 'ROLLBACK' : rollBackTransaction(); break;

            case 'COMMIT' : commitTransaction(); break;
            
            case 'END': process.exit();  break;
            default: console.log("Invalid Command"); dataBase(); /* show menu again if input does not match */;
        }
        dataBase()
    });
}

const beginTransaction=()=>{
    if(nestedTransaction===null) 
        nestedTransaction=0
    else
        nestedTransaction++
    transactions.push({...pointerDB})
    pointerDB=transactions[nestedTransaction]
}

const rollBackTransaction=()=>{
    if(nestedTransaction===null) return 
    if(nestedTransaction===0){
        clearTransactions
        return 
    }
    nestedTransaction--
    pointerDB=transactions[nestedTransaction]
    transactions.pop();
}

const commitTransaction=()=>{
    DB=transactions[nestedTransaction]
    clearTransactions()
}

const clearTransactions=()=>{
    transactions=[]
    pointerDB=DB
    nestedTransaction=null
}


const set=(name,value)=>{
    pointerDB[name]=value;
}

const get=(name)=>{
    console.log('Result:', pointerDB[name] || 'NULL')
}

const unset=(name)=>{
    delete pointerDB[name]
}

const numEqualTo = (value)=>{
    const coincidences= Object.values(pointerDB).filter(v=>v==value).length 
    console.log('Coincidences:',coincidences)
}



dataBase();