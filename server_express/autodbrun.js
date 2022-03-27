const dbtimer = require("./DBtimer")
const istest = require("./module/serverIsTest/index")

var currentmode = istest.NOWNUM()

currentmode.then((val) => {
	dbtimer.preset_addDB(0,Number(val),0)
	dbtimer.preset_addRepeatTime(60)
	dbtimer.preset_initial_ratesetting(25, 1)

	dbtimer.START()
})
