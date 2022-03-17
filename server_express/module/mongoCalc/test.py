import sys

fget = sys.argv[1]
fvar = sys.argv.copy().pop(0)
fvar.pop(0)

if fget == 0:
    print(fvar ,"hello?")
    sys.stdout.flush()