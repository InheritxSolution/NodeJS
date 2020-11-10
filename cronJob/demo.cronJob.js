var CronJob = require('cron').CronJob;

const getFeedData = async () => {
	console.log("getFeedData");
	return true;
};

const job = new CronJob({
	cronTime: '00 * * * * *',
	onTick: async () => {
		if (job.taskRunning) {
			return
		}

		job.taskRunning = true
		try {
			await getFeedData();
		} catch (err) {
		// Handle error
		}
		job.taskRunning = false
	},
	start: true,
	timeZone: 'UTC'
})