document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM SELECTORS ---
    const screenOutput = document.getElementById('screen');
    const buttonsContainer = document.querySelector('.calculator__buttons');
    const themeRadios = document.querySelectorAll('input[name="theme"]');

    // --- 2. STATE VARIABLES ---
    let currentOperand = '0';
    let previousOperand = '';
    let activeOperator = null;
    let shouldResetScreen = false;

    // --- 3. THEME TOGGLE LOGIC ---
    function applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        const radioInput = document.getElementById(themeName);
        if (radioInput) {
            radioInput.checked = true;
        }
    };

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
            return;
        }

        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (systemPrefersDark) {
            applyTheme('theme-1');
            return;
        }

        if (systemPrefersLight) {
            applyTheme('theme-2');
            return;
        }

        applyTheme('theme-1');
    }

    // --- 4. CALCULATOR CORE LOGIC ---
    function resetCalculator() {
        currentOperand = '0';
        previousOperand = '';
        activeOperator = null;
        shouldResetScreen = false;
    }

    function deleteLastCharacter() {
        currentOperand = currentOperand.slice(0, -1);
        if (currentOperand === '') {
            currentOperand = '0';
        }
    }

    function appendInput(value) {
        const digitCount = currentOperand.replace(/[^0-9]/g, '').length;
        if (digitCount >= 15 && !shouldResetScreen) return;

        if (shouldResetScreen) {
            currentOperand = value === '.' ? '0.' : value;
            shouldResetScreen = false;
            return;
        }

        if (value === '.') {
            if (currentOperand.includes('.')) return;
            currentOperand += '.';
            return;
        }

        if (currentOperand === '0') {
            currentOperand = value;
        } else {
            currentOperand += value;
        }
    }

    function handleOperator(operator) {
        if (currentOperand === 'Error') return;

        if (activeOperator !== null && !shouldResetScreen) {
            calculateResult();
        }

        previousOperand = currentOperand;
        activeOperator = operator;
        shouldResetScreen = true;
    }

    function calculateResult() {
        const operand1 = parseFloat(previousOperand);
        const operand2 = parseFloat(currentOperand);
        if (isNaN(operand1) || isNaN(operand2) || activeOperator === null) return;

        let result;
        switch (activeOperator) {
            case '+': result = operand1 + operand2; break;
            case '-': result = operand1 - operand2; break;
            case 'x': result = operand1 * operand2; break;
            case '/':
                if (operand2 === 0) {
                    result = 'Error';
                } else {
                    result = operand1 / operand2;
                }
                break;
            default: return;
        }

        if (result === 'Error') {
            currentOperand = 'Error';
        } else {
            // Clean up decimal inaccuracies
            result = parseFloat(result.toFixed(10));
            currentOperand = result.toString();
        }
        previousOperand = '';
        activeOperator = null;
        shouldResetScreen = true;
    }

    function formatDisplay(valueStr) {
        if (valueStr === 'Error' || valueStr === '') return valueStr;

        const parts = valueStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];

        let formattedInteger = '';
        if (integerPart === '-') {
            formattedInteger = '-';
        } else if (integerPart !== '') {
            formattedInteger = Number(integerPart).toLocaleString('en-US');
        }

        if (decimalPart !== undefined) {
            return `${formattedInteger}.${decimalPart}`;
        }
        return formattedInteger;
    }

    function updateDisplay() {
        screenOutput.textContent = formatDisplay(currentOperand);
    }

    buttonsContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('calculator__button')) return;

        const buttonValue = e.target.textContent;
        if (!buttonValue) return;

        if (e.target.classList.contains('theme-switch__track')) return;

        if (buttonValue >= '0' && buttonValue <= '9') {
            appendInput(buttonValue);
        } else if (buttonValue === '.') {
            appendInput(buttonValue);
        } else if (buttonValue === 'RESET') {
            resetCalculator();
        } else if (buttonValue === 'DEL') {
            deleteLastCharacter();
        } else if (buttonValue === '=') {
            calculateResult();
        } else if (['+', '-', 'x', '/'].includes(buttonValue)) {
            handleOperator(buttonValue);
        }

        updateDisplay();
    });

    themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                applyTheme(e.target.id); // e.g. "theme-1", "theme-2", "theme-3"
            }
        });
    });

    initTheme();
});
