const countries: Record<string, { countryCode: string; countryName: string }> = {
  turkey: { countryCode: "TR", countryName: "Türkiye" }, türkiye: { countryCode: "TR", countryName: "Türkiye" }, tr: { countryCode: "TR", countryName: "Türkiye" }, germany: { countryCode: "DE", countryName: "Germany" }, deutschland: { countryCode: "DE", countryName: "Germany" }, de: { countryCode: "DE", countryName: "Germany" }, japan: { countryCode: "JP", countryName: "Japan" }, jp: { countryCode: "JP", countryName: "Japan" }, "united states": { countryCode: "US", countryName: "United States" }, usa: { countryCode: "US", countryName: "United States" }, us: { countryCode: "US", countryName: "United States" }
};
export function mapProfileLocation(location: string): { countryCode: string; countryName: string; confidence: "estimated" } | undefined {
  const values = location.split(",").map((value) => value.trim().toLocaleLowerCase()).filter(Boolean);
  const country = values.length > 1 ? countries[values.at(-1)!] : countries[values[0]];
  return country ? { ...country, confidence: "estimated" } : undefined;
}
export function flagForCountry(code: string): string { return code.toUpperCase(); }
