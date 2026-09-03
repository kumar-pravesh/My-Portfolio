try {
  require("child_process").execSync("npx --no-install husky", {
    stdio: "inherit",
  });
} catch (e) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.CI ||
    process.env.RENDER
  ) {
    console.log("Husky installation skipped in CI/Production.");
  } else {
    console.warn(
      "Husky installation failed. This is expected in production builds where devDependencies are omitted.",
    );
  }
}
