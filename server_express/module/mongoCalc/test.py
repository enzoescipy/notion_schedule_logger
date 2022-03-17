import sys

fget = sys.argv[1]
fvar = sys.argv.copy()
fvar.pop(0)
fvar.pop(0)


if fget == "0":
    print(fget, fvar, "hello?")
    sys.stdout.flush()
else:
    print("invalid input.")
    sys.stdout.flush()
