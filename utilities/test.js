import { CronJob } from 'cron';

let i = 0;
let taskRunning = false;

const job = new CronJob(
	'*/1 * * * * *',
	() => {
		if (taskRunning) {
			console.log('jeszcze idzie');
			return;
		}
		taskRunning = true;
		setTimeout(() => {
			console.log(`poszło teraz - ${i++}`);
			taskRunning = false;
		}, 8000);
	},
	null,
	false,
	'Europe/Warsaw'
);
job.start();
