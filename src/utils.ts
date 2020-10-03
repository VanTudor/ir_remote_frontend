export function stringBoolToBool(value: string): boolean {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Cannot convert stringBool to Bool. Unknown value '${value}'.`);
}