export function members<Enum extends object, Key extends keyof Enum>(
  enumType: Enum,
): Key[] {
  return Object
    .keys(enumType)
    .filter(function onlyStrings(key) {
      // NOTE(dabrady) Non-numeric strings will coerce to `NaN` when cast as a Number.
      // So this little test is an effective way of excluding numeric object keys.
      return Number.isNaN(+key);
    }) as Key[];
}
