## Java2K Interpreter
##
## For more information on Java2k, checkout the official webpage at
## http://p-nand-q.com/humor/programming_languages/java2k.html
##
## Copyright (C) 2004-4002 by Gerson Kurz (http://p-nand-q.com). 
## All rights reserved. Free for any use whatsoever, enjoy!

import random, sys

# no comment from here on.
VERSION = "PSI"

def isWhitespace(c):
    return (c == '-') or (c == '\r') or (c == '\n') or ((c >= 'A') and (c <= 'Z') and (c != 'E') and (c != 'S'))

def isDigit(c):
    return (c >= '0' and c <= '9') or (c == ' ')
    
def digit(c):
    if c >= '0' and c <= '9':
        return ord(c) - ord('0')
    return 10

class java2k:
    def __init__(self):
        self.strict = False
        self.resultThrowError = False
        self.functions = {
            1001 : 
            1008 : self.VARUSE, # get arg0[arg1]
            1561 : self.SECURE, # throw error in Xen2K
            1568 : self.DIV,
            1638 : self.ADD,
            1687 : self.SUB,
            1715 : self.MUL,
            1806 : self.NAND, # NAND operation
            1813 : self.SHL # SHIFT arg0's Bit left arg1 times
            2177 : self.SET, # arg1 = arg0
            2541 : self.STOP, # stop the program
            2548 : self.VARDEC, # declare integer list named arg1, with its length arg0
            2562 : self.OUTC, # print ascii code of arg0
            7931 : self.IFEQ, # last compared was equal -> execute arg0, else -> execute arg1
            7938 : self.IFLT, # arg0 < arg1 -> execute arg0, else arg1
            7980 : self.CMP, # compare arg0 and arg1 -> use this with 7931
            8225 : self.WHILE, # infinite loop with execute arg0, excute arg1 if error occurred
        }

    def read(self, filename):
        return self.parse(open(filename).read())
        
    def parse(self, data):
        tokens = self.tokenize(data)
        self.resultIsRandom = False
        self.variables = {}
        instructionSequence = []
        # parse the instructions
        offset = 0
        while offset < len(tokens):
            instruction, l = self.processRecursive(tokens, offset)
            instructionSequence.append( instruction )
            offset += l
        # Now we have parsed data of program. Execute it
        self.ip = 0 # initialize the instructor pointer
        self.outcCalled = False
        self.instructionSequence = instructionSequence
        while self.ip < len(self.instructionSequence):
            instruction = self.instructionSequence[self.ip]
            self.ip += 1
            
            try:
                self.invoke(instruction)
            except StopIteration:
                break
        
        if not self.outcCalled:
            print(self.result)
        
    def processRecursive(self, tokens, offset):
        argument = tokens[offset]
        if argument == '*' or argument == '_':
            return argument, 1
        
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
            raise "ERROR, '%s' is not a valid function ID (context: %s)" % (token, str(tokens[offset-4:offset+4]))
    
    def set(self, value):
        self.resultIsRandom = False
        self.result = value
        return self.result
    
    def arg(self, argument):
        if argument == '*':
            return self.set( random.randint(0, 12345) )
            
        elif argument == '_':
            return self.result
            
        return self.set( self.invoke(argument) )
        
    def invoke(self, instruction):
        function, a, b = instruction
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
        raise StopIteration
               
    def WHILE(self, args):
        while True:
            self.set(self.arg(a))
            if self.resultThrowError:
                self.set(self.arg(b))
                self.resultThrowError = False
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
        self.resultThrowError = True
        return
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
            
            elif c in "/\*_+.=":
                if isRecordingNumber:
                    isRecordingNumber = False
                    result.append( number )
                result.append( c )
            
            elif self.strict:
                if not isWhitespace(c):
                    raise "ERROR, '%s' is not a whitespace." % c
                
        if isRecordingNumber:
            result.append( number )
            
        return result

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
       
def itojava2k(number):
    "Given an integer, return java2k code rep for it."
    
    def checkrnd():
        return random.randint(0, 1) == 0
    
    def code2():
        return ("+", ("/", "?", "_"), "_" )
    
    def code1():
        return ("/", "?", "_")
        
    def mullist(result):
        if len(result) == 1:
            return result[0]
        return ("*", result[0], mullist(result[1:]))
        
    def addlist(result):
        if len(result) == 1:
            return result[0]
        return ("+", result[0], addlist(result[1:]))
    
    i, result = 0, []
    while number:
        if number % 2:
            if i:
                result.append(mullist([code2() for k in range(i)])) 
            else:
                result.append(code1())
        i += 1
        number >>=1
    result = addlist(result)

    # result is now a code tree, generate code from that. 
    def generate(code):
        try:
            c = {
                '+' : "125 ",
                '/' : "11 6",
                "*" : "131 ",
            }[code[0]]
            assert len(code) == 3
            a, b = generate(code[1]), generate(code[2])
            if checkrnd():
                return "%s/%s/%s\\" % (c, a, b)
            else:
                return "%s=%s+%s." % (c, b, a)
                
        except KeyError:
            assert len(code) == 1
            
            if code[0] == "?":
                return "*"
            
            elif code[0] == "_":
                return "_"
                
            else:
                assert False
    
    # just in case you're curios what I'm up to, uncomment these lines:
    #
    #import pprint
    #pprint.pprint(result)
    result = generate(result)
    
    #if comments:
    #    import quotes
    #    n = random.randint(1, len(result) / 4)
    #    
    #    result = list(result)
    #    def randomquote():
    #        return quotes.quotes[random.randint(0, len(quotes.quotes)-1)]
    #        
    #    for k in range(n):
    #        result.insert( random.randint(0, len(result) ), randomquote() )
    #        
    #    result = "".join(result)
            
    return result
    
