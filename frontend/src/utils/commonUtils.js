import { parseISO, format } from 'date-fns';

export const calculateTime = (iso8601 = '') => {
    if (!iso8601) return null;
    const date = parseISO(iso8601);

    const day = format(date, 'dd');
    const month = format(date, 'MM');
    const year = format(date, 'yyyy');

    const hours = format(date, 'HH');
    const minutes = format(date, 'mm');

    return {
        day,
        month,
        year,
        hours,
        minutes,
    };
};
