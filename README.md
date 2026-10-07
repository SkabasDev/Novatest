# Nova Checkout

Checkout de un producto con pago por tarjeta de crédito: vitrina → datos de tarjeta/entrega → resumen de pago → resultado → vitrina con stock actualizado.

Monorepo con dos apps independientes:

- [`backend/`](./backend) — API REST en NestJS + TypeScript, Arquitectura Hexagonal (Ports & Adapters), Railway Oriented Programming (ROP), TypeORM + PostgreSQL + Redis (bloqueo distribuido de stock).
- [`frontend/`](./frontend) — SPA en React + TypeScript + Redux Toolkit + Tailwind CSS.

Specs de arranque de cada capa: [`../FRONTEND.md`](../FRONTEND.md), [`../BACKEND.md`](../BACKEND.md), [`../DESIGN_CONTEXT.md`](../DESIGN_CONTEXT.md).

## Flujo de negocio (5 pantallas)

1. **Producto** — vitrina con descripción, precio y stock.
2. **Tarjeta + entrega** — modal con validación de tarjeta (Luhn + detección VISA/MasterCard) y dirección de envío.
3. **Resumen** — backdrop con desglose: producto + tarifa base + envío = total.
4. **Resultado** — estado final de la transacción (aprobada/rechazada/error).
5. **Producto** — redirección con stock actualizado.

## Cómo correr el proyecto localmente

### Backend

```bash
cd backend
cp .env.example .env        # completar con las credenciales de la pasarela de pago sandbox

# Opción A — PostgreSQL + Redis en Docker, API local con hot-reload
docker compose up -d postgres redis
npm install
npm run seed                # carga productos dummy
npm run start:dev           # http://localhost:3000 — Swagger en /docs

# Opción B — todo en Docker (PostgreSQL + Redis + API)
docker compose up -d --build
```

Redis respalda el bloqueo distribuido por producto (`shared-kernel/lock.module.ts`) que serializa el
decremento de stock entre instancias de la API — sin él, dos pagos concurrentes del mismo producto
podrían leer el mismo stock y sobrevenderlo. Ver [`BACKEND.md` §10](../BACKEND.md#10-infraestructura-como-código-y-despliegue) para el detalle.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Tests

```bash
cd backend && npm run test:cov
cd frontend && npm run test:cov
```

**Estado actual de cobertura (scaffold inicial):** el dominio y los casos de uso (la lógica de negocio, incluyendo la cadena ROP de `ProcessPaymentUseCase` y la máquina de estados de `Transaction`) están cubiertos al 100% en ambas apps. El umbral global de 80% configurado en `jest.config` todavía no se alcanza porque faltan tests de controllers, repositorios TypeORM (capa de infraestructura) y componentes de UI restantes — ver los checklists de [`BACKEND.md`](../BACKEND.md#4-test-driven-development-tdd) y [`FRONTEND.md`](../FRONTEND.md#8-testing-mínimo-80-coverage-jest) para el plan de capas pendiente (integration tests de adaptadores + e2e).

## Documentación de la API

- Swagger generado en runtime: `http://localhost:3000/docs`
- Postman collection: _pendiente de exportar y enlazar aquí una vez el backend esté desplegado_.

## Modelo de datos

Ver [`BACKEND.md` §6](../BACKEND.md#6-modelo-de-datos-postgresql) para el esquema completo de `Product`, `Customer`, `Delivery` y `Transaction`.

## Despliegue

Pendiente — ver [`BACKEND.md` §10](../BACKEND.md#10-infraestructura-como-código-y-despliegue) para el plan de despliegue en AWS (ECS Fargate + RDS, o Lambda + API Gateway).

## Notas de seguridad

- Los números de tarjeta completos y el CVC **nunca** se persisten ni en el backend ni en `localStorage` del frontend — solo se guardan `cardLast4` y `cardBrand`.
- Las API keys de la pasarela de pago viven en variables de entorno (`.env`, excluido de git) y nunca se hardcodean.
