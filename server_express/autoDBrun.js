const dbtimer = require("./DBtimer")
const istest = require("./module/serverIsTest/index")


var currentmode = istest.NOWNUM()

currentmode.then(start)

async function start(val)
{
	await dbtimer.preset_addDB(0,Number(val),0)
	await dbtimer.preset_addRepeatTime(20)
	await dbtimer.preset_initial_ratesetting(25, 1)

	await dbtimer.START()
}