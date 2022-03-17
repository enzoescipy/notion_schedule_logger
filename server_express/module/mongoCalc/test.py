import sys
import copy

fget = sys.argv[1]
fvar = sys.argv.copy()
fvar.pop(0)
fvar.pop(0)

print(fvar,"hello?")
sys.stdout.flush()