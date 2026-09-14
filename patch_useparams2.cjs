const fs = require('fs');
let code = fs.readFileSync('src/routes/AppRouter.tsx', 'utf8');

if (!code.includes('useParams }')) {
  code = code.replace(/import { Routes, Route, Navigate } from 'react-router-dom';/, "import { Routes, Route, Navigate, useParams } from 'react-router-dom';");
}
fs.writeFileSync('src/routes/AppRouter.tsx', code);
