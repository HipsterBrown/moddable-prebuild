import { type as platformType } from "os";
import { pipeline } from "stream";
import { promisify } from "util";
import { createWriteStream } from "fs";
import * as core from "@actions/core";
import { join, resolve, relative } from "path";
import { exec, getExecOutput } from "@actions/exec";
import * as tar from "tar";

const MODDABLE_REPO = "https://github.com/Moddable-OpenSource/moddable";
const pipe = promisify(pipeline);

const PLATFORMS: Record<string, string> = {
  darwin: "mac",
  linux: "lin",
  windows_nt: "win"
};

async function gzipBuild(input: string, output: string) {
  const tarStream = tar.create({ gzip: true }, [input]);
  const destination = createWriteStream(output);
  await pipe(tarStream, destination);
}

async function run() {
  try {
    const commit = core.getInput("commit");
    const platform = PLATFORMS[platformType().toLowerCase()];
    const arch = process.arch;

    if (platform === "lin") {
      core.info("Installing dependencies...");
      await exec("sudo", ["apt-get", "update"]);
      await exec("sudo", [
        "apt-get",
        "install",
        "--yes",
        "gcc",
        "git",
        "wget",
        "make",
        "libncurses-dev",
        "flex",
        "bison",
        "gperf",
        "libgtk-3-dev",
      ]);
    }

    core.info(`Building tools for ${platform}`);

    core.info("Cloning Moddable-OpenSource/moddable repo");
    await exec("git", ["clone", MODDABLE_REPO]);
    core.info("Cloning complete");

    process.env.MODDABLE = join(process.cwd(), "moddable");
    core.info(`Set MODDABLE env variable: ${process.env.MODDABLE}`);

    if (commit && commit !== "latest") {
      core.info(`Checking out commit: ${commit}`);
      await exec("git", ["checkout", commit], { cwd: process.env.MODDABLE });
    }

    core.info(`Set BUILD_DIR variable`);
    const BUILD_DIR = resolve(
      process.env.MODDABLE,
      "build",
      "makefiles",
      platform
    );
    core.info(`Building tools in ${BUILD_DIR}`);
    if (platform === "win") {
      await exec("vcvarsall.bat x86_x64", [], { cwd: BUILD_DIR });
      // process.env.COMSPEC = "devenv.exe";
    }
    await exec(platform === "win" ? `./build.bat` : "make", [], { cwd: BUILD_DIR });

    const artifactName = `moddable-build-tools-${platform}-${arch}.tgz`;

    await gzipBuild(
      relative(process.cwd(), process.env.MODDABLE),
      artifactName
    );

    const { stdout: tag } = await getExecOutput(
      "git",
      ["rev-parse", "--short", "HEAD"],
      {
        cwd: process.env.MODDABLE,
      }
    );

    core.setOutput("tag", tag.trim());
    core.setOutput("artifactName", artifactName);
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
