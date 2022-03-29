const dbtimer = require("./DBtimer")
const istest = require("./module/serverIsTest/index")


var currentmode = istest.NOWNUM()

currentmode.then(start)

async function start(val)
{
	await dbtimer.preset_addDB(0,Number(val),0)
	await dbtimer.preset_addDB(0,Number(val),1)
	await dbtimer.preset_addDB(0,Number(val),2)
	await dbtimer.preset_addDB(0,Number(val),3)
	
	await dbtimer.preset_addRepeatTime(600)
	await dbtimer.preset_initial_ratesetting(25, 1)

	await dbtimer.START()
}