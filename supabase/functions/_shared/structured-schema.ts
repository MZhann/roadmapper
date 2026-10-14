// OpenAI supports anyOf, while Zod emits oneOf for discriminated unions.
// Our alternatives use distinct literal `type` values, so these are equivalent.
export function structuredSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(structuredSchema);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key === "oneOf" ? "anyOf" : key,
        structuredSchema(item),
      ]),
    );
  return value;
}
