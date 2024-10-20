
# Tempeh - cli

Command Line Interface for tempeh, declarative routing package for Next.js >= 13.

https://github.com/user-attachments/assets/d1acc6bb-fd92-4c7e-b7ff-4d0641f79e59


## About the project

This project was initiated as an exploration of the effect ecosystem. Leveraging effect libraries, it aims to streamline the process of generating routes through a Command Line Interface (CLI). This automation significantly reduces redundancy, especially for projects where most routes lack complex parameters or search parameter schemas.

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
