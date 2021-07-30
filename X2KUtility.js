// Utility for Xen2K

function isWhitespace(c) {
    return (c === '-') || (c === '\r') || (c === '\n') || ((c >= 'A') && (c <= 'Z') && (c !== 'E') && (c !== 'S'));
}

function isDigit(c){
    return (c.charCodeAt(0) >= '0'.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0)) || (c === ' ');
}
function digit(c){
    if (c.charCodeAt(0) >= '0'.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0)){
        return (c.charCodeAt(0) - '0'.charCodeAt(0));
    }
    return 10;
}

function atoi(number) {
    //"Given a 11-based number, return the integer for it"
    var result = 0;
    for (var c of number){
        if (isDigit(c)){
            result *= 11;
            result += digit(c);
		}
        else{
            break;
		}
	}
    return result;
}

function itoa(number) {
    //"Given a number, return a 11-based representation of it."
    var result = [];
    while (number !== 0){
        r = number % 11;
        if (r < 10) {
            result.push( r.toString() );
		}
		else if (r == NaN) { // we have to check this no matter of what type of r is.
			return "";
		}
        else {
            result.push( ' ' );
		}
        number = Math.trunc(number / 11);
	}
    result.reverse();
    return result.join('');
}

//class

var MathHelper = {
    // Get a value between two values
    clamp: function (value, min, max) {

        if (value < min) {
            return min;
        }
        else if (value > max) {
            return max;
        }

        return value;
    },
    // Get the linear interpolation between two value
    lerp: function (value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    }

};
