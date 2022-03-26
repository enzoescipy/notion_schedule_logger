class Mathfunc:
    
    @staticmethod
    def smallDip_increase_maintain(starting=0.5, upperbound = 1):
        original_func = [(0,1.36),(1,0.58),(2,0.16),(3,2.06),(4,3.79),(5,4.11),(6,5.00)] #calculated by function_reward.ggb geogebra5
        parallel_mover = 0
        multiplier = 1
        multiplier = (starting - upperbound) /( original_func[0][1] - original_func[6][1])
        parallel_mover = starting - original_func[0][1] * multiplier
        adjusted_function = []
        for point in original_func:
            adjusted_function.append((point[0], point[1]*multiplier + parallel_mover))
        return adjusted_function

def normal_rewardfunc(num):
    num = num - 1
    base = Mathfunc.smallDip_increase_maintain()
    print(base)
    if 0 <= num <= 6:
        return base[num][1]
    elif num > 6:
        return base[6][1]
    elif num == -1:
        return 0.0
    else:
        return -1
Mathfunc.normal_rewardfunc = normal_rewardfunc

normal_rewardfunc(3)
