import './App.css';
import DigitButton from './DigitButton';
import OperationButton from './OperationButton.js';
import { useReducer,useEffect} from 'react';
export const ACTIONS = {
  ADD_DIGIT:'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR_ALL: 'clear_all',
  DELETE:'delete',
  EVALUATE: 'evaluate',
  NEGATE: 'negate',
  CLEAR_HISTORY: 'clear_history'
}

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        if (payload.digit === ".")
        {
          payload.digit ="0";
          return {
            ...state,
            currentOperand: 0,
            overwrite: false,
          }
        }
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state;
      }
      if (payload.digit === "." && state.currentOperand == null) {
        return state;
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state;
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }

      return {
        ...state,
        // eslint-disable-next-line no-undef
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }
    case ACTIONS.CLEAR_ALL:
      return {}
    case ACTIONS.CLEAR_HISTORY:
      return {...state, history:[]}
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      if (state.currentOperand == null) return state
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      }
    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }
      const result = evaluate(state);
      const newEntry = `${state.previousOperand} ${state.operation} ${state.currentOperand} = ${result}`;
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: result,
        history: [...(state.history || []), newEntry],
      }
    case ACTIONS.NEGATE:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      if (state.currentOperand == null) return state

      return {
        ...state,
        currentOperand: negate(state),
      }
      default:
    break;
  }
}
function negate({currentOperand,previousOperand,operation})
{
  let curr = parseFloat(currentOperand);
  return (-curr).toString();
}
function evaluate({currentOperand,previousOperand,operation})
{
  let curr = parseFloat(currentOperand);
  let prev = parseFloat(previousOperand);
  if (operation ==="/")
    return (prev/curr).toString();
  if (operation ==="+")
    return (curr+prev).toString();
  if (operation ==="-")
    return (prev-curr).toString();
  if (operation ==="x")
    return (prev*curr).toString();
}
function App() {
  let [{currentOperand,previousOperand,operation,history},dispatch] =useReducer(reducer,{});
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
  
      if (/\d/.test(key)) {
        // Digit key
        dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: key } });
      } else if (key === ".") {
        dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "." } });
      } else if (key === "+" || key === "-" || key === "/" || key === "*") {
        let op = key === "*" ? "x" : key;
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: op } });
      } else if (key === "Enter" || key === "=") {
        event.preventDefault(); // avoid form submission side-effects
        dispatch({ type: ACTIONS.EVALUATE });
      } else if (key === "Backspace") {
        dispatch({ type: ACTIONS.DELETE_DIGIT });
      } else if (key === "Escape") {
        dispatch({ type: ACTIONS.CLEAR_ALL });
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="calculator">
      <div className="App">
        <div className="output"> 
          <div className='previous-operand'> {previousOperand}{operation} </div>
          <div className='current-operand'>{currentOperand}</div>
        </div>
        <button className= "AC" onClick={() => dispatch({ type: ACTIONS.CLEAR_ALL })}>AC</button>
        <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
        <button
          //className="span-two"
          onClick={() => dispatch({ type: ACTIONS.NEGATE })}
        >
          &#xb1;
        </button>
        <OperationButton operation="+" dispatch={dispatch} />
        <DigitButton digit="1" dispatch={dispatch} />
        <DigitButton digit="2" dispatch={dispatch} />
        <DigitButton digit="3" dispatch={dispatch} />
        <OperationButton operation="x" dispatch={dispatch} />
        <DigitButton digit="4" dispatch={dispatch} />
        <DigitButton digit="5" dispatch={dispatch} />
        <DigitButton digit="6" dispatch={dispatch} />
        <OperationButton operation="/" dispatch={dispatch} />
        <DigitButton digit="7" dispatch={dispatch} />
        <DigitButton digit="8" dispatch={dispatch} />
        <DigitButton digit="9" dispatch={dispatch} />
        <OperationButton operation="-" dispatch={dispatch} />
        <DigitButton digit="." dispatch={dispatch} />
        <DigitButton digit="0" dispatch={dispatch} />
        <button
          className="span-two"
          onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
        >
          =
        </button>
      </div>
      <div className="history">
      <ul>
        <h1>History</h1>
        <button onClick={()=> dispatch({type:ACTIONS.CLEAR_HISTORY})}>Clear</button>
          {(history || []).map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
      </ul>
      </div>
      <a 
  href="https://hungnq0104.com/" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="about-link"
>
  About Me
</a>
    </div>
  );
}

export default App;
