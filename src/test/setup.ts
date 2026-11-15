// Las pruebas leen la interfaz en español: sus aserciones se escribieron con
// esos textos antes de que existiera el inglés. El idioma oficial de la app es
// el inglés; lo que garantiza que los dos idiomas digan lo mismo son las
// pruebas de src/i18n/i18n.test.ts (mismas claves, mismos huecos, nada vacío).
// Una prueba que quiera el inglés llama a setLocale("en").
import { setFallbackLocale } from "@/i18n";

setFallbackLocale("es");
