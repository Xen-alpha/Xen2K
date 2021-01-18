/**
 * Xen2K Javascript Converter
**/
const VERSION = "PSI 0.0.1";

function isWhitespace(c) {
    return (c == '-') || (c == '\r') || (c == '\n') || ((c >= 'A') && (c <= 'Z') && (c != 'E') && (c != 'S'));
}

function isDigit(c){
    return (c >= '0' && c <= '9') || (c == ' ');
}
function digit(c){
    if (c >= '0' && c <= '9'){
        return ord(c) - ord('0');
    }
    return 10;
}

function Xen2K() {
    this.functions = {
        // 1001 : self.SETWIN // set windows with size (arg0, arg1)
        1008 : self.VARUSE, // "837": get arg0[arg1]
        // 1015 : self.PUSH // "843": Push current self.result to self.resultlist
        // 1022 : self.POP // "84 ": Pop the self.result from self.resultlist
        1561 : self.SECURE, // "119 ": throw error in Xen2K
        1568 : self.DIV, // "11 6"
        1638 : self.ADD, // "125 "
        1687 : self.SUB, // "12 4"
        1715 : self.MUL, // "131 "
        1806 : self.NAND, // "13 2": NAND operation
        1813 : self.SHL, // "13 9": SHIFT arg0's Bit left arg1 times
        2177 : self.SET, // "16  " : arg0 <= arg1
        2541 : self.STOP, // "1 00": stop the program
        2548 : self.VARDEC, // "1 07" : declare integer list named arg1, with its length arg0
        2562 : self.OUTC, // "1 1 " : print ascii code of arg0(not working on windows mode)
        2569 : self.OUTSTR, // "1 26": print ascii code array of arg0(not working on windows mode)
        7931 : self.IFEQ, // "5 60" : last compared was equal -> execute arg0, else -> execute arg1
        7938 : self.IFLT, // "5 67" : arg0 < arg1 -> execute arg0, else arg1
        7980 : self.CMP, // "5  5" : compare arg0 and arg1 -> use this with 7931
        8225 : self.WHILE, // "61 8" : infinite loop with execute arg0, excute arg1 if error occurred
    }
}