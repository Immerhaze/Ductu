# DUCTU  
### Plataforma SaaS de Gestión Académica

DUCTU es un sistema web de gestión académica diseñado para instituciones educativas.  
Permite la administración estructurada de usuarios, roles, procesos institucionales y comunicación interna mediante una arquitectura modular y escalable.

La plataforma está construida con tecnologías modernas de desarrollo web, aplicando principios de arquitectura limpia y control de acceso basado en roles, garantizando mantenibilidad y crecimiento a largo plazo.

---

## 🚀 Tecnologías Utilizadas

### Frontend
- React JS
- Next.js (App Router)
- JavaScript
- Tailwind CSS
- Arquitectura basada en componentes

### Backend e Infraestructura
- Prisma ORM
- PostgreSQL (Neon)
- Control de acceso basado en roles (RBAC)
- Git y GitHub para control de versiones

---

## 🧩 Módulo Principal – Administración de Usuarios

Este repositorio incluye la implementación del **Módulo de Administración de Usuarios**, desarrollado como parte de la evidencia académica GA7-220501096-AA4-EV03.

### Funcionalidades Implementadas

- Listado de usuarios institucionales
- Visualización de detalle por usuario
- Registro manual de nuevos usuarios
- Asignación y gestión de roles
- Integración con el panel administrativo
- Protección de rutas según rol
- Validación de formularios
- Manejo de estados de carga y error

El módulo está alineado con las historias de usuario, casos de uso y artefactos de diseño definidos previamente en el ciclo del desarrollo del software.

---

## 🏗️ Estructura del Proyecto

El proyecto sigue una estructura modular organizada por responsabilidad:
/app
/dashboard
/admin
/components
/lib
/services
/prisma


### Principios Arquitectónicos Aplicados

- Separación de responsabilidades
- Organización modular
- Componentes reutilizables
- Capa de servicios desacoplada
- Control de acceso por roles
- Convenciones claras de nomenclatura (PascalCase y camelCase)
- Comentarios en lógica crítica del sistema

---

## 🔐 Autenticación y Autorización

DUCTU implementa un sistema de control de acceso basado en roles (RBAC):

- Super Administrador
- Administrador institucional
- Docente
- Estudiante

Las rutas administrativas están protegidas y solo pueden ser accedidas por usuarios autorizados.

---

## 🧭 Flujo de Navegación

El sistema ofrece navegación estructurada dentro del panel administrativo:

- Panel principal (Dashboard)
- Gestión de usuarios
- Vista de detalle de usuario
- Formulario de creación de usuario

La navegación es gestionada mediante el sistema de rutas de Next.js (App Router), garantizando control de acceso y experiencia fluida.

---

## ⚙️ Configuración para Desarrollo Local

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]

2. Instalar dependencias
npm install
3. Ejecutar el servidor de desarrollo
npm run dev

La aplicación se ejecutará en:

http://localhost:3000

```
📊 Estado Actual del Proyecto

Actualmente el sistema incluye:

Sistema de autenticación

Flujo de onboarding institucional

Módulo de administración de usuarios

Gestión de invitaciones

Publicaciones institucionales

Modelado de base de datos con Prisma

Panel administrativo con control por roles

El proyecto se encuentra en desarrollo activo y evoluciona hacia una solución SaaS académica completamente escalable.

📌 Acceso al Repositorio

El repositorio se encuentra en modo privado debido a que el proyecto está en desarrollo activo.
Se ha otorgado acceso al instructor para su respectiva revisión académica.

👨‍💻 Autor

Nicolás Romero Carrillo
Tecnólogo en Análisis y Desarrollo de Software
Proyecto Académico – ADSO
