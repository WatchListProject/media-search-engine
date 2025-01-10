import { format } from 'date-fns';

export const formatDate = function (dateString: string): string {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }

        return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
        return 'Invalid date';
    }
}