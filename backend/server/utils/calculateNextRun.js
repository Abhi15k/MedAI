export function calculateNextRunAt(startDate, time, frequency) {

    const [hours, minutes] = time.split(':');
    const nextRun = new Date(startDate);
    nextRun.setHours(hours);
    nextRun.setMinutes(minutes);
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
  
    // If scheduled time already passed today, move to the next period
    while (nextRun < new Date()) {
      if (frequency === 'Daily') {
        nextRun.setDate(nextRun.getDate() + 1);
      } else if (frequency === 'Weekly') {
        nextRun.setDate(nextRun.getDate() + 7);
      } else if (frequency === 'Monthly') {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }
  
    return nextRun;
  }
  