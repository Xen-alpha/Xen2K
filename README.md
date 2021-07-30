# Xen2K
A Java2K variant, but it's deterministic

See http://p-nand-q.com/programming/languages/java2k/manual.html to know the Java2K base coding

# Built-in functions

Do not use specific function names that has a number name which are in the range between 1000~9999 (The range is expressed in 10-digit numbers)

There are built-in functions comes from original Java2K in that range.

----

"function name"

description

----

"125 "

Add argument [0] to argument [1]

"11 6"

Divide argument [0] by argument [1]

"12 4"

Subtract argument [1] from argument [0]

"131 "

Multiply argument [0] with argument [1]

"13 2"

NAND argument[0] with argument[1]

"13 9"

Shift argument[0]'s bits left for argument[1](number) times (you can make any 32-bit integer at most within 95 operations including using this function, how useful...)

"16  "

[two spaces] Assign argument[0] to argument[1], Note that this works on an array's element.

"1 1 "

This function will output argument [0] as single ASCII character

"1 26"

This function will output a string of character list named argument[0](The character inside list is not limited to ASCII)

"1 00"

Exit program.

"61 8"

Loop forever, executing argument[0]. If the instruction fails, argument[1] is executed instead.

"5  5"

Compare argument[0], argument[1]

"5 60"

If both arguments last compared were equal, execute argument[0], else argument[1]

"5 67"

If argument[0] was less than argument [1], execute argument[0], else argument[1]

"1 07"

Declare an array of argument[0] elements named - numerically - by argument[1].

"837"

Use variable named argument[0], indexed by argument[1].

"119 "

Throw error to last seen "61 8" loop so that it can cease. Parameters of this function will be ignored.

# safe list name

11digit.txt has usable list names context. if you need to define some lists, check these strings for your list variables.

# header.txt

User-defined functions will go into header.txt

Functions must be defined in a line with prefix "! ". There are two sample functions inside the header file. You can erase them and make some new ones

# user-defined functions

You can use user-defined functions in header.txt with this phrase.

    >(function index)<

Note that the (function index) must be the result of a built-in caculation. The >< part will be replaced with the user-defined function.