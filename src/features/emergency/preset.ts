// Emergencia con la persona ya elegida: /emergencia?quien=<id de perfil>.
// Lo usa, por ejemplo, el Botiquín ("Contacta al cirujano de vuelo") para no
// hacer elegir otra vez a quien ya está en pantalla.
const PARAM = "quien";

/** Dirección de la emergencia; con `personId`, esa persona llega elegida. */
export const emergencyHref = (personId?: string) =>
  personId
    ? `/emergencia?${PARAM}=${encodeURIComponent(personId)}`
    : "/emergencia";

/** Persona que pide la dirección (`location.search`), si es de la tripulación. */
export function presetPerson(
  search: string,
  crewIds: readonly string[],
): string | null {
  const id = new URLSearchParams(search).get(PARAM);
  return id !== null && crewIds.includes(id) ? id : null;
}
