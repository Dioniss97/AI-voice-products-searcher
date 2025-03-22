# Guía de Contribución y Flujo de Trabajo DevOps

## Estructura de Ramas

### Ramas Principales
- `master`: Código en producción
- `develop`: Código en desarrollo

### Ramas de Características
- Formato: `feature/nombre-de-la-caracteristica`
- Ejemplo: `feature/mejora-reconocimiento-voz`

### Ramas de Corrección
- Formato: `hotfix/descripcion-del-problema`
- Ejemplo: `hotfix/correccion-error-microfono`

### Ramas de Release
- Formato: `release/version-x.x.x`
- Ejemplo: `release/v1.0.0`

## Flujo de Trabajo

### 1. Desarrollo de Nuevas Características
```bash
# Crear nueva rama de característica
git checkout develop
git checkout -b feature/nueva-caracteristica

# Realizar cambios y commits
git add .
git commit -m "feat: descripción de la característica"

# Subir cambios
git push origin feature/nueva-caracteristica

# Crear Pull Request a develop
```

### 2. Correcciones Urgentes
```bash
# Crear rama de hotfix
git checkout master
git checkout -b hotfix/correccion

# Realizar cambios y commits
git add .
git commit -m "fix: descripción de la corrección"

# Subir cambios
git push origin hotfix/correccion

# Crear Pull Request a master
```

### 3. Preparación de Release
```bash
# Crear rama de release
git checkout develop
git checkout -b release/v1.0.0

# Preparar release
git add .
git commit -m "chore: preparar versión 1.0.0"

# Subir cambios
git push origin release/v1.0.0

# Crear Pull Request a master y develop
```

## Convención de Commits

Utilizamos la convención de commits semánticos:

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests
- `chore:` Tareas de mantenimiento

## Proceso de Code Review

1. Crear Pull Request con descripción detallada
2. Esperar revisión de al menos un desarrollador
3. Resolver comentarios y sugerencias
4. Asegurar que los tests pasan
5. Merge después de aprobación

## CI/CD

El proyecto utiliza GitHub Actions para:
- Tests automáticos
- Linting
- Build
- Deploy automático a staging/producción

## Requisitos para Contribuir

1. Tener Node.js v20 o superior instalado
2. Tener npm instalado
3. Tener Git instalado
4. Tener acceso al repositorio
5. Seguir las convenciones de código establecidas 