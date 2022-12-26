/**
 * @param value 
 * @returns 
 */
export const getTime = (value: number) => {
  let date = new Date(value);
  let yy: number | string = date.getFullYear();
  let mm: number | string = date.getMonth() + 1;
  let dd: number | string = date.getDate();
  let xs: number | string = date.getHours();
  let ff: number | string = date.getMinutes();
  let ss: number | string = date.getSeconds();
  mm = mm >= 10 ? mm : '0' + mm;
  dd = dd >= 10 ? dd : '0' + dd;
  xs = xs >= 10 ? xs : '0' + xs;
  ff = ff >= 10 ? ff : '0' + ff;
  ss = ss >= 10 ? ss : '0' + ss;
  return `${yy}-${mm}-${dd} ${xs}:${ff}`
};