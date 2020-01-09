import moment from 'moment';

class Calendar {
    /**
     *
     * @param holidays {Array<string>}
     * @param format {string}
     * @param workingHours {Array<number>}
     */
    constructor(holidays, format, workingHours) {
        this.holidays = new Set(holidays);
        this.format = format;
        [this.workStartHour, this.workEndHour] = workingHours;
    }

    /**
     *
     * @param date {Date || moment.Moment}
     * @return {boolean}
     */
    isHoliday(date) {
        return this.holidays.has(moment(date).format(this.format));
    }

    /**
     *
     * @param start {Date || moment#Moment}
     * @param end {Date || moment#Moment}
     * @return {number}
     */
    computeTaskDuration(start, end) {
        const startDate = moment(start);
        const endDate = moment(end);
        const { workStartHour, workEndHour } = this;
        const workingHours = workEndHour - workStartHour;
        const dayDiff = moment(endDate)
            .startOf('day')
            .diff(
                moment(startDate)
                    .add(1, 'day')
                    .startOf('day'),
                'days'
            );
        const startDateHours = this.getBusinessDayEnd(startDate).diff(
            startDate,
            'hours',
            true
        );
        const endDateHours = endDate.diff(
            this.getBusinessDayStart(endDate),
            'hours',
            true
        );
        let duration = startDateHours + endDateHours;
        if (dayDiff > 0) {
            duration += (dayDiff - this.holidaysNum(start, end)) * workingHours;
        }
        if (dayDiff === -1 && startDate.date() === endDate.date()) {
            duration = endDate.diff(startDate, 'hours', true);
        }

        return duration;
    }

    /**
     *
     * @param start {Date || moment.Moment}
     * @param end {Date || moment.Moment}
     * @return {number}
     */
    holidaysNum(start, end) {
        const { holidays } = this;
        const startDate = moment(start);
        const endDate = moment(end);
        let holidaysNum = 0;
        for (startDate; startDate <= endDate; startDate.add(1, 'day')) {
            if (holidays.has(startDate.format('YYYY-MM-DD'))) {
                holidaysNum += 1;
            }
        }
        return holidaysNum;
    }

    /**
     *
     * @param day {Date || moment.Moment}
     * @return {Date}
     */
    getNextWorkingDay(day) {
        const result = moment(day);
        while (this.isHoliday(result)) {
            result.add(1, 'day');
        }
        return result.toDate();
    }

    /**
     *
     * @param date {Date || moment.Moment}
     * @param isStart {Boolean}
     * @return {Date}
     */
    placeDateInWorkingRange(date, isStart = false) {
        const { workStartHour, workEndHour } = this;
        const workingDate = moment(this.getNextWorkingDay(date));
        const workStart = moment(workingDate)
            .startOf('day')
            .hours(workStartHour);
        const workEnd = moment(workingDate)
            .startOf('day')
            .hours(workEndHour)
            .add(-1, 'second');
        if (
            workingDate.isBetween(
                moment(workStart).add(-1, 'second'),
                moment(workEnd)
            )
        ) {
            return workingDate.toDate();
        }

        if (isStart && workingDate.isSameOrAfter(workEnd)) {
            return this.getNextWorkingDay(
                this.getBusinessDayStart(workingDate.add(1, 'day'))
            );
        }

        return moment.min(workStart, workingDate) === workingDate
            ? workStart.toDate()
            : workEnd.toDate();
    }

    /**
     *
     * @param day {Date || moment.Moment}
     * @return {moment.Moment}
     */
    getBusinessDayStart(day) {
        const { workStartHour } = this;
        return moment(day)
            .startOf('day')
            .hours(workStartHour);
    }

    /**
     *
     * @param day {Date || moment.Moment}
     * @return {moment.Moment}
     */
    getBusinessDayEnd(day) {
        const { workEndHour } = this;
        return moment(day)
            .startOf('day')
            .hours(workEndHour);
    }

    getWorkingHours() {
        const { workStartHour, workEndHour } = this;
        return workEndHour - workStartHour;
    }

    computeTaskEndDate(startDate, duration) {
        const { workStartHour, workEndHour } = this;
        const workingHours = workEndHour - workStartHour;
        let endDate = moment(startDate);
        let remainDuration = duration;
        while (remainDuration > 0 || this.isHoliday(endDate)) {
            if (this.isHoliday(endDate)) {
                endDate.add(1, 'day');
            } else if (remainDuration - workingHours >= 0) {
                remainDuration -= workingHours;
                if (
                    remainDuration === 0 &&
                    endDate.isSame(this.getBusinessDayStart(endDate))
                ) {
                    endDate = this.getBusinessDayEnd(endDate.add(-1, 'day'));
                }
                endDate.add(1, 'day');
            } else {
                const timeOverflow = moment(endDate)
                    .add(remainDuration, 'hour')
                    .diff(this.getBusinessDayEnd(endDate), 'hours', true);
                if (timeOverflow > 0) {
                    remainDuration = timeOverflow;
                    endDate = this.getBusinessDayStart(endDate.add(1, 'day'));
                } else {
                    endDate.add(remainDuration, 'hour');
                    remainDuration = 0;
                }
            }
        }
        return this.placeDateInWorkingRange(endDate.toDate());
    }

    getBusinessHoursRange(startDate, endDate) {
        const sign = Math.sign(endDate - startDate);
        const start = moment(Math.min(startDate, endDate));
        const end = moment(Math.max(startDate, endDate));
        const holidaysNum = this.holidaysNum(start, end);
        const standardRange = end.diff(start, 'hour', true);
        const range = sign * (standardRange - holidaysNum * 24);
        return range;
    }

    addWithWeekendsSkip(start, hours) {
        const s = moment(start);
        const sign = Math.sign(hours);
        const workingHours = 24;
        let hoursToAdd = Math.abs(hours);
        // skip holidays if start date is holiday
        while (this.isHoliday(s)) {
            s.add(sign, 'day');
        }
        while (hoursToAdd) {
            if (hoursToAdd < workingHours) {
                s.add(sign * hoursToAdd, 'hour');
                hoursToAdd = 0;
            } else {
                s.add(sign, 'day');
                hoursToAdd -= workingHours;
            }
            // skip holidays
            while (this.isHoliday(s)) {
                s.add(sign, 'day');
            }
        }
        return s.toDate();
    }
}

export default Calendar;
