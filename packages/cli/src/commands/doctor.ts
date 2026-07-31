import { Command } from "commander";
import chalk from "chalk";
import { PiperProcessAdapter } from "@modelforce/provider-piper";
import { isPiperInstalled, getPiperBinPath, getVoicesDir, loadConfig } from "../config.js";

function check(label: string, ok: boolean, detail?: string): string {
  const icon = ok ? chalk.green("✓") : chalk.red("✗");
  const text = chalk.bold(label);
  const line = `  ${icon} ${text}`;
  if (detail) {
    return `${line}\n  │  ${chalk.dim(detail)}`;
  }
  return line;
}

function warn(label: string, detail: string): string {
  const icon = chalk.yellow("⚠");
  const text = chalk.bold(label);
  return `  ${icon} ${text}\n  │  ${chalk.dim(detail)}`;
}

export const doctorCommand = new Command("doctor")
  .description("Check system health and dependencies")
  .action(async () => {
    console.log(chalk.bold.cyan("\nModelForce Doctor v0.1.0\n"));

    // System
    console.log(check("System", true));
    console.log(`  │  Node ${chalk.dim(process.version)}`);
    console.log(`  │  ${chalk.dim(process.platform)} ${chalk.dim(process.arch)}`);
    console.log();

    // Provider
    const piperInstalled = await isPiperInstalled();
    if (piperInstalled) {
      const adapter = new PiperProcessAdapter({
        binPath: getPiperBinPath(),
        voicesDir: getVoicesDir(),
      });

      const health = await adapter.health();
      const voices = await adapter.listVoices();
      const healthy = health.status === "healthy";

      console.log(check("Provider: Piper", healthy, healthy ? `Binary found` : health.details));
      console.log(`  │  Voices: ${chalk.bold(String(voices.length))} installed`);
      if (voices.length > 0) {
        for (const v of voices.slice(0, 5)) {
          const gender = v.gender === "female" ? chalk.magenta("♀") : v.gender === "male" ? chalk.blue("♂") : chalk.gray("○");
          console.log(`  │    ${gender} ${v.id} ${chalk.dim(`(${v.language})`)}`);
        }
        if (voices.length > 5) {
          console.log(`  │    ${chalk.dim(`... and ${voices.length - 5} more`)}`);
        }
      }
    } else {
      console.log(warn("Provider: Piper", "Not installed"));
      console.log(`  │  ${chalk.cyan("Run:")} modelforce pull piper`);
    }
    console.log();

    // Configuration
    const config = await loadConfig();
    const hasConfig = config.activeProvider !== null;
    console.log(check("Configuration", hasConfig, hasConfig ? undefined : "No active provider"));
    if (config.activeProvider) {
      console.log(`  │  Active: ${chalk.bold(config.activeProvider)}`);
    }
    if (config.defaultVoice) {
      console.log(`  │  Default voice: ${chalk.bold(config.defaultVoice)}`);
    }
    console.log(`  │  Installed voices: ${chalk.bold(String(config.installedVoices.length))}`);
    console.log();

    // Summary
    const allOk = piperInstalled;
    if (allOk) {
      console.log(chalk.green.bold("  ✓ System OK\n"));
    } else {
      console.log(chalk.yellow.bold("  ⚠ Setup incomplete\n"));
    }
  });
