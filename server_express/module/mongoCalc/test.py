from datetime import date, datetime
day1 = "2022-03-17"
day2 = "2022-03-18"
list1 = [day2, day1]
list1.sort(key=lambda x:date.fromisoformat(x))
print(list1)