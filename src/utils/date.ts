import moment from 'moment';

moment.locale('ru');

export function dateTimeFormat(date: number | Date | string): string {
  return moment(date).format('DD.MM.YYYY HH:mm');
}

export function dateFormat(
  date: number | Date | string,
  isFull?: boolean,
): string {
  return moment(date).format(isFull ? 'DD.MM.YYYY, HH:mm' : 'DD.MM.YYYY');
}

export function timeFormat(date: number | Date | string): string {
  return moment(date).format('HH:mm');
}

export function dateISOFormat(date: Date): string {
  return `${moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS')}Z`;
  // return date.toISOString(); - Not work approach
}

export function getMonthName(monthNumber: number): string {
  return moment()
    .month(monthNumber)
    .format('MMMM');
}
export function getMonthNameUpper(monthNumber: number): string {
  const month = getMonthName(monthNumber);
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function getMonthNameUpperShort(monthNumber: number): string {
  if (monthNumber === 4) return 'Май';
  const month = getMonthName(monthNumber);
  return `${month.charAt(0).toUpperCase()}${month.slice(1, 3)}.`;
}

export const isDefined = (value: any) => value !== null && value !== undefined;

export const formatDaysLeftFrom = (date: Date | string) => {
  return Math.max(
    0,
    moment(date)
      .startOf('day')
      .diff(moment().startOf('day'), 'days'),
  ).toString();
};
