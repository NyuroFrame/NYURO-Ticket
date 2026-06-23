#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando NYURO Ticket en desarrollo...${NC}"

echo -e "${BLUE}📦 Generando cliente Prisma...${NC}"
pnpm --filter @nyuro/database db:generate

echo -e "${BLUE}🗄️  Aplicando migraciones...${NC}"
pnpm --filter @nyuro/database exec prisma migrate deploy

echo -e "${BLUE}🔧 Levantando backend en http://localhost:3001${NC}"
PORT=3001 pnpm --filter @nyuro/api dev &
API_PID=$!

echo -e "${BLUE}🎨 Levantando frontend en http://localhost:3000${NC}"
pnpm --filter @nyuro/web dev &
WEB_PID=$!

echo -e "${BLUE}🗃️  Abriendo Prisma Studio...${NC}"
pnpm --filter @nyuro/database db:studio &
STUDIO_PID=$!

cleanup() {
  echo -e "${BLUE}🛑 Deteniendo servicios...${NC}"
  kill $API_PID $WEB_PID $STUDIO_PID 2>/dev/null || true
  exit
}

trap cleanup INT TERM

echo -e "${GREEN}✅ Todo listo!${NC}"
echo -e "${GREEN}   Frontend:      http://localhost:3000${NC}"
echo -e "${GREEN}   Backend:       http://localhost:3001${NC}"
echo -e "${GREEN}   Prisma Studio: http://localhost:5555${NC}"
echo -e "${BLUE}Presiona Ctrl+C para detener todos los servicios.${NC}"

wait
