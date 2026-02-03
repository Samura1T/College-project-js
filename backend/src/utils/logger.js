let RED = "\u001B[41m";
let GREEN = "\u001B[42m";
let YELLOW = "\u001B[43m";
let RESET = "\u001B[0m";

export class Logger {
    log = (msg) => {
        console.log(GREEN + " [LOG] " + new Date() + " - " + msg + "" + RESET);
    }

    warn = (msg) => {
        console.warn(YELLOW + " [WARN] " + new Date() + " - " + msg + "" + RESET);
    }

    error = (msg) => {
        console.error(RED + " [ERROR] " + new Date() + " - " + msg + "" + RESET);
    }
}
export default Logger;