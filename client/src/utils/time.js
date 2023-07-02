export default function getFormattedDate(dt) {
    let incomingDate = new Date(dt);
    let formatDate = {
        day: date(incomingDate.getDate()),
        month: date(incomingDate.getMonth() + 1),
        year: incomingDate.getFullYear(),
        hours: time(incomingDate.getHours()),
        minutes: time(incomingDate.getMinutes()),
        weekday: incomingDate.toLocaleString("en-US", {
            weekday: "short",
        }),
    };

    function time(hourOrMin) {
        return String(hourOrMin).length === 1 ? "0" + hourOrMin : hourOrMin;
    }

    function date(dayOrMonth) {
        return String(dayOrMonth).length === 1 ? "0" + dayOrMonth : dayOrMonth;
    }
    return `${formatDate.day}.${formatDate.month}.${formatDate.year} ${formatDate.hours}:${formatDate.minutes}`;
}