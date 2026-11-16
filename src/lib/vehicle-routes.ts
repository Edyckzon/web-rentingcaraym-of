// URL pública independiente del ID que relaciona las fotografías en Supabase.
export function vehicleSlug(id: string) {
  return ({'jetur-x70':'jetour-x70','jac-s8':'jac-js8','toyota-yaris':'toyota-corolla'} as Record<string,string>)[id] ?? id;
}
export function vehicleId(slug: string) {
  return ({'jetour-x70':'jetur-x70','jac-js8':'jac-s8','toyota-corolla':'toyota-yaris'} as Record<string,string>)[slug] ?? slug;
}
