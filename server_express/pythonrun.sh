#!/bin/sh

git pull
echo "enter python module name without .py :"
read PYNAME
echo "enter variable you want to put in. ex) string1 string2 int1... :"
read VARS
python3-server/bin/python module/mongoCalc/${PYNAME}.py $VARS

