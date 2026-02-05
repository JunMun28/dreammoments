const [major, minor, patch] = process.versions.node.split(".").map(Number)

const ok =
	(major === 20 && (minor > 19 || (minor === 19 && patch >= 0))) ||
	(major === 22 && (minor > 12 || (minor === 12 && patch >= 0))) ||
	major > 22

if (!ok) {
	console.error(
		`Node ${process.versions.node} unsupported. Need 20.19+ (20.x) or 22.12+ (22+).\n` +
			`Fix:\n` +
			`- nvm: nvm install 22.12.0 && nvm use 22.12.0\n` +
			`- or: install Node 20.19.0+\n`,
	)
	process.exit(1)
}

