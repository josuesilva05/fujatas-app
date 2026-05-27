# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and Biome linting and formatting.

The project is configured to use Biome via `biome.json`, and includes scripts for `npm run format` and `npm run lint`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Linting with Biome

This project uses Biome for linting and formatting. Configure rules in `biome.json` and run:

- `npm run lint` → `biome check .`
- `npm run format` → `biome format .`

If you want stricter TypeScript linting, enable additional Biome rule sets in `biome.json`.
