#!/bin/bash
export HOST=0.0.0.0
export PORT=3000
echo "Iniciando servidor en http://localhost:3000"
echo "También intenta: http://127.0.0.1:3000"
npm run dev -- --hostname 0.0.0.0