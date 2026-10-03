# Contribuir a Spärck

## Flujo de trabajo

1. Creá una rama desde la rama base correspondiente.
2. Hacé cambios pequeños y verificables.
3. Cuando el cambio esté listo, pedile a tu agente que use la skill
   `sparck-release` para validar la rama, ejecutar los checks, generar la
   descripción y abrir el pull request hacia `master`. Está disponible para
   Codex, Claude Code y otros agentes que sigan `AGENTS.md`.
4. Esperá que pasen los checks de GitHub y que una persona con acceso de
   escritura lo apruebe.

### Sin la skill

Si preferís preparar el pull request manualmente, antes de abrirlo ejecutá:

   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm test:coverage
   pnpm build
   ```

- `pnpm lint` detecta errores de estilo y patrones problemáticos.
- `pnpm exec tsc --noEmit` verifica los tipos de TypeScript sin generar archivos.
- `pnpm test:coverage` ejecuta los tests y falla si la cobertura queda debajo
  del mínimo requerido.
- `pnpm build` comprueba que la aplicación pueda compilarse para producción.

Después, subí la rama y abrí un pull request hacia `master` con una descripción
clara de los cambios.

No se permiten pushes directos, force pushes ni eliminaciones de `master`. Si el
pull request cambia después de ser aprobado, necesita una nueva aprobación.

## Cobertura

La suite exige al menos 80% de cobertura de líneas, funciones y branches en el
código ejecutado por los tests. Cuando un cambio agregue lógica o corrija un error,
agregá un test que compruebe el comportamiento esperado. Los cambios de contenido
o estilos no necesitan un test nuevo si no modifican lógica.
