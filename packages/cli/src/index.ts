#!/usr/bin/env node

import { Command } from "commander";
import { searchCommand } from "./commands/search.js";
import { pullCommand } from "./commands/pull.js";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { statusCommand } from "./commands/status.js";
import { registryCommand } from "./commands/registry.js";
import { pluginsCommand } from "./commands/plugins.js";
import { modelsCommand } from "./commands/models.js";
import { voicesCommand } from "./commands/voices.js";
import { charactersCommand } from "./commands/characters.js";
import { runtimeCommand } from "./commands/runtime.js";
import { benchmarkCommand } from "./commands/benchmark.js";
import { eventsCommand } from "./commands/events.js";
import { doctorCommand } from "./commands/doctor.js";
import { configCommand } from "./commands/config.js";
import { synthesizeCommand } from "./commands/synthesize.js";

const program = new Command();

program
  .name("modelforce")
  .description("ModelForce Voice Ecosystem CLI")
  .version("0.1.0");

program.addCommand(pullCommand);
program.addCommand(installCommand);
program.addCommand(uninstallCommand);
program.addCommand(voicesCommand);
program.addCommand(synthesizeCommand);
program.addCommand(benchmarkCommand);
program.addCommand(doctorCommand);
program.addCommand(searchCommand);
program.addCommand(statusCommand);
program.addCommand(registryCommand);
program.addCommand(pluginsCommand);
program.addCommand(modelsCommand);
program.addCommand(charactersCommand);
program.addCommand(runtimeCommand);
program.addCommand(eventsCommand);
program.addCommand(configCommand);

program.parse();
