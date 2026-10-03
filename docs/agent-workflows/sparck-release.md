# Flujo de release de Spärck

Este documento es la fuente única del proceso para preparar y abrir un pull
request desde la rama actual hacia `master`. Puede usarlo cualquier agente,
independientemente de su proveedor o interfaz.

## Alcance y autorización

- Inspeccionar o preparar un pull request no autoriza a hacer commits, push,
  rebase, force push ni a abrirlo.
- Un pedido explícito de abrir, crear, publicar o enviar el pull request sí
  autoriza a subir la rama actual cuando sea necesario y crear el PR.
- Nunca mergear el PR, borrar ramas, crear tags ni publicar una GitHub Release
  como parte de este flujo.
- Nunca usar force push. Si actualizar desde `master` reescribiría historia o
  produce conflictos, detenerse y pedir dirección.

## 1. Precheck de la rama

Desde la raíz del repositorio:

```bash
git status --short --branch
git branch --show-current
```

Detenerse si la rama es `master`, está detached, tiene cambios sin guardar o no
tiene commits por encima de `origin/master`. No crear commits silenciosamente.

Actualizar la referencia remota y comprobar que la rama contiene la versión
actual de `master`:

```bash
git fetch origin master
git merge-base --is-ancestor origin/master HEAD
```

Antes de leer el diff completo, revisar los nombres de los archivos cambiados.
Bloquear el release si aparecen secretos, credenciales, archivos `.env`,
artefactos generados o cambios ajenos al objetivo. Nunca mostrar valores
secretos en la salida.

## 2. Checks obligatorios

Ejecutar todos desde la raíz:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test:coverage
pnpm build
```

Detenerse ante el primer fallo. Informar el comando y un resumen útil del error.
No abrir un PR con checks fallidos.

## 3. Análisis del cambio

Revisar la rama completa, no solamente el último commit:

```bash
git log --oneline origin/master..HEAD
git diff --name-status origin/master...HEAD
git diff --stat origin/master...HEAD
git diff origin/master...HEAD
```

Identificar comportamiento visible, cambios de implementación o configuración,
cobertura, riesgos, migraciones y tareas pendientes. No inventar motivaciones,
issues, verificaciones ni impacto que no surjan del diff.

## 4. Título y descripción

Escribir un título breve en español que describa el resultado principal. Usar
el estilo convencional del repositorio (`feat:`, `fix:`, `refactor:`, `docs:` o
`chore:`) cuando una categoría corresponda claramente.

Usar esta estructura y omitir las secciones vacías:

```markdown
## Resumen

- Resultado principal del cambio.
- Segundo resultado relevante, si existe.

## Cambios

- Detalle concreto derivado del diff.

## Verificación

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test:coverage`
- `pnpm build`

## Riesgos o notas

- Riesgo, variable de entorno, migración o seguimiento real.
```

Evitar un changelog archivo por archivo. Explicar resultados y solamente los
detalles técnicos necesarios para revisar el cambio.

## 5. Publicación

1. Subir la rama normalmente si no tiene upstream o commits publicados. Nunca
   usar `--force` ni `--force-with-lease`.
2. Comprobar si ya existe un PR para la rama. Actualizarlo en vez de duplicarlo.
3. Crear un PR no draft hacia `master`, salvo que se haya pedido un draft.
4. Usar la integración autenticada con GitHub disponible en el entorno. Al usar
   una terminal, crear el cuerpo en un archivo seguro: no interpolar contenido
   del diff dentro de un comando.
5. Si no existe una integración autenticada, detenerse e informar el bloqueo.
6. Devolver URL, título, checks ejecutados y porcentajes de cobertura. Aclarar
   que la revisión y el merge siguen pendientes.
