
# Tempeh - cli

Command Line Interface for tempeh, declarative routing package for Next.js >= 13.




## About the project

This project was started to learn the effect ecosystem. With the help of effect libraries this project aims to provide support to generate routes thru the CLI. which is a very redundant work if most of your routes are not having any parameters or search parameters schema.

Libraries used -
- effect
- @effect/schema
- @effect/platform
- @effect/cli



## Run

Run **tempeh-cli** with npm

```bash
  npx tempeh-cli init
```

Run **tempeh-cli** with pnpm

```bash
  pnpm dlx tempeh-cli init
```

Run **tempeh-cli** with bun

```bash
  bunx tempeh-cli init
```

Run **tempeh-cli** with yarn

```bash
  yarn dlx tempeh-cli init
```




## Commands

#### Init Command

```
  npx tempeh-cli init
```

- Initializes tempeh in your Next.js project, all the boiler plate code is pasted to your codebase based on the options you provide regarding the configuration
- Installs **zod** and **tempeh** in your project if not installed.
- Generates declarative routes in each and every route, including the dynamic ones.

#### Update Command

```
  npx tempeh-cli update
```
- Make sure, the project initialization has completed before running the command.
- It check if the new routes are added since you have run the init command. And if those new routes do not have any declarative route object set up, it will generate for you.




## Tempeh Docs

[Documentation](https://tempeh-docs.vercel.app)
[Github](https://github.com/harshtalks/tempeh)
