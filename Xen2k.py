## Java2K Interpreter
##
## For more information on Java2k, checkout the official webpage at
## http://p-nand-q.com/humor/programming_languages/java2k.html
##
## Copyright (C) 2004-4002 by Gerson Kurz (http://p-nand-q.com). 
## All rights reserved. Free for any use whatsoever, enjoy!

import random, sys

# no comment from here on.
VERSION = "PSI 0.1.0"

def isWhitespace(c):
    return (c == '-') or (c == '\r') or (c == '\n') or ((c >= 'A') and (c <= 'Z') and (c != 'E') and (c != 'S'))

def isDigit(c):
    return (c >= '0' and c <= '9') or (c == ' ')
    
def digit(c):
    if c >= '0' and c <= '9':
        return ord(c) - ord('0')
    return 10

class BreakLoop(Exception):
    pass

class StopProgram(Exception):
    def __str__(self):
        return "Program Terminated"
class ProgramError(Exception):
    def __str__(self):
        return "ERROR, Invalid instruction Detected"
class Xen2K(object):
    def __init__(self):
        self.strict = False
        self.lastUse = 0
        self.functions = {
            # 1001 : self.SETWIN # set windows with size (arg0, arg1)
            1008 : self.VARUSE, # "837": get arg0[arg1]
            # 1015 : self.PUSH # "843": Push current self.result to self.resultlist
            # 1022 : self.POP # "84 ": Pop the self.result from self.resultlist
            1561 : self.SECURE, # "119 ": throw error in Xen2K
            1568 : self.DIV, # "11 6"
            1638 : self.ADD, # "125 "
            1687 : self.SUB, # "12 4"
            1715 : self.MUL, # "131 "
            1806 : self.NAND, # "13 2": NAND operation
            1813 : self.SHL, # "13 9": SHIFT arg0's Bit left arg1 times
            2177 : self.SET, # "16  " : arg0 <= arg1
            2541 : self.STOP, # "1 00": stop the program
            2548 : self.VARDEC, # "1 07" : declare integer list named arg1, with its length arg0
            2562 : self.OUTC, # "1 1 " : print ascii code of arg0(not working on windows mode)
            2569 : self.OUTSTR, # "1 26": print ascii code array of arg0(not working on windows mode)
            7931 : self.IFEQ, # "5 60" : last compared was equal -> execute arg0, else -> execute arg1
            7938 : self.IFLT, # "5 67" : arg0 < arg1 -> execute arg0, else arg1
            7980 : self.CMP, # "5  5" : compare arg0 and arg1 -> use this with 7931
            8225 : self.WHILE, # "61 8" : infinite loop with execute arg0, excute arg1 if error occurred
        }
        self.userfunctions = [] # function token list derived from header.txt will be saved in here
    def readuserfunctions(self):
        self.userfunctions = []
        datafile = open("header.txt")
        data = datafile.read()
        if data != "":
            functiondata = data.split('!')
            if len(functiondata) > 0:
                del functiondata[0] # removing useless string
            if len(functiondata) > 0:
                for func in functiondata:
                    tokens = self.tokenize(func)
                    self.userfunctions.append(tokens)
        datafile.close()
    def read(self, filename):
        datafile = open(filename)
        data = datafile.read()
        datafile.close()
        return self.parse(data)
    def parse(self, data):
        # first, read headerfile
        self.readuserfunctions()
        # next, tokenize the data
        tokens = self.tokenize(data)
        self.resultIsRandom = False
        self.resultlist = []
        self.variables = {}
        instructionSequence = []
        # parse the instructions in tokens
        offset = 0
        while offset < len(tokens):
            instruction, l = self.processRecursive(tokens, offset)
            instructionSequence.append( instruction )
            offset += l
        # Now we have parsed data of program. Execute it.
        self.ip = 0 # initialize the instructor pointer
        self.outcCalled = False
        self.instructionSequence = instructionSequence
        while self.ip < len(self.instructionSequence):
            instruction = self.instructionSequence[self.ip]
            self.ip += 1
            try:
                self.invoke(instruction,False)
            except StopProgram as e:
                print(e)
                break
        if not self.outcCalled:
            print(self.result)
    
    def processRecursive(self, tokens, offset):
        argument = tokens[offset]
        if argument == '*' or argument == '_':
            return argument, 1
        elif argument == '>':
            #function caller, just make it inline so make a sub-tokens
            temptokens = tokens.reverse()
            temptokensEndpoint=temptokens.index('<') # find first < character
            subtokens = temptokens[temptokensEndpoint+1:len(tokens)-offset]
            subtokens = subtokens.reverse()
            # now do the recursive read and do the invoke test
            instruction, l = self.processRecursive(subtokens, 0)
            # invoke and get the self.result to find index of self.userfunctions
            # we can expect that only one self.result will be derived since we expect only one result
            self.result = self.arg(instruction, True)
            # now self.result holds the index of self.userfunctions.
            instruction, notused = self.processRecursive(self.userfunctions[self.result], 0)
            return instruction, l+2 # >(function context)< --> result the instruction tree with invocation passed 
        # no special
        self.context = (tokens, offset)
        function = self.lookupFunction(tokens[offset])
        a, len_a = self.processRecursive(tokens, offset+2)
        b, len_b = self.processRecursive(tokens, offset+len_a+3)
        len_combined = len_a+len_b+4
        if tokens[offset+1] == '/':
            return (function, a, b), len_combined
        else:
            return (function, b, a), len_combined
        
    def lookupFunction(self, token):
        try:
            return self.functions[token]
        except KeyError:
            tokens, offset = self.context
            raise ProgramError    
    def set(self, value):
        self.result = value
        return self.result
    
    def arg(self, argument, DoNotDisplay = False):
        if argument == '*':
            return self.set( random.randint(0, 12345) )
            
        elif argument == '_':
            return self.result
            
        return self.set( self.invoke(argument, DoNotDisplay) )
        
    def invoke(self, instruction, DoNotDisplay = False):
        function, a, b = instruction
        if DoNotDisplay and function == self.OUTC:
            return self.set(self.arg(a))
        return function(a,b)
        
    def ADD(self, a, b): 
        return self.set( self.arg(a) + self.arg(b) )
        
    def DIV(self, a, b):
        return self.set( self.arg(a) / self.arg(b) )
        
    def SUB(self, a, b):
        return self.set( self.arg(a) - self.arg(b) )
        
    def MUL(self, a, b):
        return self.set( self.arg(a) * self.arg(b) )
        
    def OUTC(self, a, b): 
        sys.stdout.write( chr( self.set( self.arg(a) ) & 0x7F ) )
        self.outcCalled = True
    def OUTSTR(self, a, b):
        print(str(self.variables[self.arg(a)])) # OK, Only Ascii can be printed
        self.set(self.variables[self.arg(a)])
        self.outcCalled = True
    # 1806 : self.NAND, # NAND operation
    def NAND(self, a, b):
        a, b = bool(self.arg(a)), bool(self.arg(b))
        def nand(a, b):
            return int(not (a and b))
        return self.set( nand(a, b) )
    # 1813 : self.SHL # SHIFT arg0's Bit left arg1 times
    def SHL(self, a, b):
        return self.set(self.arg(a) << self.arg(b))
    
    def SET(self, a, b):
        a, b = self.arg(a), self.arg(b)
        self.variables[self.lastUse][a] = b
        return self.set( b )

    def STOP(self, a, b):
        raise StopProgram
               
    def WHILE(self, args):
        while True:
            try:
                self.set(self.arg(a))
            except BreakLoop:
                self.set(self.arg(b))
                break
    # 7980 : self.CMP, # compare arg0 and arg1 -> use this with 7931
    def CMP(self, a, b):
        a, b = self.arg(a), self.arg(b)
        self.cmpEqual = a == b
        self.cmpLess = a < b
        
    def IFEQ(self, args):
        a, b = self.arg(a), self.arg(b)
        if self.cmpEqual:
            return self.set(a)
        else:
            return self.set(b)
        
    def IFLT(self, args):
        a, b = self.arg(a), self.arg(b)
        if self.cmpLess:
            return self.set(a)
        else:
            return self.set(b)
        
    def VARDEC(self, a, b):
        a, b = self.arg(a), self.arg(b)
        self.variables[b] = [0] * (a+1)
        return 0
        
    def VARUSE(self, a, b):
        a, b = self.arg(a), self.arg(b)
        self.lastUse = a
        return self.set( self.variables[a][b] )
    # 1561: self.SECURE # do the break in 
    def SECURE(self, a, b):
        raise BreakLoop
    def tokenize(self, data):            
        result = []
        number = 0
        isRecordingNumber = False
        for c in data:
            if isDigit(c):
                if not isRecordingNumber:
                    isRecordingNumber = True
                    number = digit(c)
                else:
                    number *= 11
                    number += digit(c)
            elif c in "><": # user-defined function call
                if isRecordingNumber:
                    isRecordingNumber = False
                    result.append( number )
                result.append( c )
            elif c in "/\*_+.=": # built-in function call
                if isRecordingNumber:
                    isRecordingNumber = False
                    result.append( number )
                result.append( c )
        if isRecordingNumber:
            result.append( number )
        return result
# from here this is not a part of java2k class
def atoi(number):
    "Given a 11-based number, return the integer for it"
    result = 0
    for c in number:
        if isDigit(c):
            result *= 11
            result += digit(c)
        else:
            break
    return result

def itoa(number):
    "Given a number, return a 11-based representation of it."
    result = []
    while number:
        r = number % 11
        if r < 10:
            result.append( chr(int(r) + ord('0')) )
        else:
            result.append( ' ' )
        number //= 11
            
    result.reverse()
    return "".join(result)

def isname(input_name):
    return atoi(input_name) % 7 == 0

def itoeval(number):
    "Given an integer, return a string of 1 and 2, representing that integer."
    i, result = 0, []
    while number:
        if number % 2:
            if i:
                result.append("*".join(["2"]*i)) 
            else:
                result.append("1")
        i += 1
        number >>=1
    return "+".join(result)

xen2K = Xen2K()
while True:
    programname = input("Please type the file name(Type \'quit\' to quit):")
    if programname == "quit":
        break
    else:
        xen2K.read(programname)
