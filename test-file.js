// Test file to demonstrate Magic Console Logger extension v2.0.0

function calculateTotal(price, tax) {
  const total = price + tax;
  console.log(`%c🪄 [calculateTotal] total`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, total);
  return total;
}

const processData = (data) => {
  const result = data.map((item) => item.value);
  return result;
};
console.log(`%c🪄 processData`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, processData);

const globalVar = "hello world";
console.log(`%c🪄 globalVar`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, globalVar);

// Example of Prettier-formatted magic log (multi-line)
console.log(
  `%c🪄 prettierFormatted`,
  `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`,
  prettierFormatted,
);

class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    const message = `Hello, ${this.name}!`;
    return message;
  }
}

// Arrow function
const multiply = (a, b) => {
  const product = a * b;
  return product;
};

// Object method
const utils = {
  format: function (text) {
    const formatted = text.toUpperCase();
    return formatted;
  },

  parse: (input) => {
    const parsed = JSON.parse(input);
    return parsed;
  },
};

// React hooks examples (new v2.0.0 feature)
const useCustomHook = useCallback(() => {
  const data = fetchData();
  return data;
}, []);
console.log(`%c🪄 useCustomHook`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, useCustomHook);

const memoizedValue = useMemo(() => {
  const heavyCalculation = computeExpensiveValue();
  return heavyCalculation;
}, [dependency]);

const handleClick = useCallback((event) => {
  event.preventDefault();
  doSomething();
}, [doSomething]);

// Function expressions
const asyncFunction = async function(id) {
  const response = await fetch(`/api/${id}`);
  return response.json();
};

// IIFE (Immediately Invoked Function Expression)
const result = (function() {
  const privateVar = "secret";
  return privateVar;
})();
