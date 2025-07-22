// Test file to demonstrate Magic Console Logger extension

function calculateTotal(price, tax) {
  const total = price + tax;
  return total;
}

const processData = (data) => {
  const result = data.map((item) => item.value);
  return result;
};

const globalVar = "hello world";

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
