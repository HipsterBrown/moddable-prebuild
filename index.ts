import * as core from "@actions/core";
import { join, resolve } from "path";
import { exec } from "@actions/exec";
import { create as createArtifact } from "@actions/artifact";
import * as glob from "@actions/glob";

const MODDABLE_REPO = "https://github.com/Moddable-OpenSource/moddable";
const client = createArtifact();

async function run() {
  try {
    const platform = core.getInput("platform");
    core.info(`Building tools for ${platform}`);

    core.info("Cloning Moddable-OpenSource/moddable repo");
    await exec("git", ["clone", MODDABLE_REPO]);

    process.env.MODDABLE = join(process.cwd(), "moddable");
    const BUILD_DIR = resolve(
      process.env.MODDABLE,
      "build",
      "makefiles",
      platform
    );
    await exec("make", [], { cwd: BUILD_DIR });

    const BIN_PATH = resolve(
      process.env.MODDABLE,
      "build",
      "bin",
      platform,
      "release"
    );
    const globber = await glob.create(join(BIN_PATH, "*"));
    const files = await globber.glob();
    const artifactName = `moddable-build-tools-${platform}`;
    const result = await client.uploadArtifact(artifactName, files, BIN_PATH);

    core.info(`Completed upload of ${result.artifactName} (${result.size})`);
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
