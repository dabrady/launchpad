type EnumValue<TEnum> = TEnum[keyof TEnum] & number|string;
type EnumObject<TEnum> = {
  [k: number]: string,
  [k: string]: EnumValue<TEnum>,
};


export function members<TEnum extends EnumObject<TEnum>, Key extends keyof TEnum>(
  enumType: TEnum,
): Key[] {
  return Object
    .keys(enumType)
    .filter(function onlyStrings(key) {
      // NOTE(dabrady) Non-numeric strings will coerce to `NaN` when cast as a Number.
      // So this little test is an effective way of excluding numeric object keys.
      return Number.isNaN(+key);
    }) as Key[];
}

export function labelOf<TEnum extends EnumObject<TEnum>, V extends EnumValue<TEnum>>(
  value: V,
  enumType: TEnum,
) {
  return Object.keys(enumType)[Object.values(enumType).indexOf(value)];
}
