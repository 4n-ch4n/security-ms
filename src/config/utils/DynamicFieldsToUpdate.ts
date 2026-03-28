export const dynamicFieldsToUpdate = (
  entity: any,
  idName: string,
  ignoreFieldsName: string[] = [],
) => {
  const fieldsToUpdate: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(entity)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      key !== idName &&
      !ignoreFieldsName.includes(key)
    ) {
      fieldsToUpdate.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fieldsToUpdate.length === 0) {
    throw new Error('No fields to update');
  }
  values.push(entity[idName]);

  return [fieldsToUpdate, values];
};
