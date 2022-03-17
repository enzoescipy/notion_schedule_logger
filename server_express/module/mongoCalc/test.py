import sys
import copy

fget = sys.argv[1]
fvar = copy.copy(sys.argv)
fvar.pop(0)
fvar.pop(0)

if fget == 0:
    print(fvar ,"hello?")
    sys.stdout.flush()
