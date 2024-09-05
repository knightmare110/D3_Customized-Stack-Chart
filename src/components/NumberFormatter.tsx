export function humanReadableNumberFormatter(num: number | string, decimalPlaces = 2, scientificNotationUpperLimit?: number): string {
    const roundLimit = 1000;
    const suffixes = ["K", "M", "B", "T"];

    if (typeof num == "string") {
        num = parseFloat(num.replace(/,/g, ""));
    }
    
    // If number is less than 10^-10 then its just 0
    if (Math.abs(num) < Math.pow(10, -10)) {
        return "0";
    }

    // Displays 2.34e-5 for 0.000023445 if scientificNotationLimit = 4
    if (scientificNotationUpperLimit && Math.abs(num) < Math.pow(10, scientificNotationUpperLimit)) {
        return num.toExponential(2).toString();
    }

    if (Math.abs(num) < roundLimit) {
        return parseFloat(num.toFixed(decimalPlaces)).toString();
    }

    let index = -1;
    while (Math.abs(num) >= roundLimit) {
        num /= 1000;
        index += 1;
    }

    return `${parseFloat(num.toFixed(decimalPlaces))}${suffixes[index]}`;
}

export const decimalNumberFormatter = (num: number | string): string  => {
    if (typeof num == "string") {
        num = Number(num);
    }

    const numberFormat = new Intl.NumberFormat(window.navigator.languages[0], { maximumFractionDigits: 2 });

    return numberFormat.format(num);
}
