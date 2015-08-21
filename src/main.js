const fs = require("fs");
const zlib = require("zlib");
const format = require("util").format;
const path = require("path");
const mkdirp = require("mkdirp");

const chalk = require("chalk");
const COLORS = {
	verbose: chalk.black.bgWhite,
	info: chalk.black.bgCyan,
	warning: chalk.black.bgYellow,
	error: chalk.white.bgRed,
	prefix: chalk.magenta.bgBlack.bold
};

const LEVELS = Object.freeze({
	verbose: 10,
	info: 20,
	warning: 30,
	error: 40
});

let logLevel = LEVELS.info;
const logFilePaths = [ ];
let logRotateSize = 0;
let consoleOutput = true;

function rotate(file) {
	if(logRotateSize > 0) {
		const stat = fs.statSync(file.path);
		if(stat.size > logRotateSize) {
			fs.closeSync(file.fd);
			const zip = zlib.gzipSync(fs.readFileSync(file.path));

			let logNumber = 1;
			while(fs.existsSync(`${ file.path }.${ logNumber }.gz`)) {
				logNumber++;
			}

			fs.writeFileSync(`${ file.path }.${ logNumber }.gz`, zip);
			fs.truncateSync(file.path, 0);
			file.fd = fs.openSync(file.path, "a");
		}
	}
}

const now = (function() {
	const months = [
		"Jan", "Feb", "Mar", "Apr",
		"May", "Jun", "Jul", "Aug",
		"Sep", "Oct", "Nov", "Dec"
	];

	return function() {
		const d = new Date();

		let date = d.getDate();
		if(date < 10) {
			date = `0${date}`;
		}

		let hours = d.getUTCHours();
		if(hours < 10) {
			hours = `0${hours}`;
		}

		let minutes = d.getUTCMinutes();
		if(minutes < 10) {
			minutes = `0${minutes}`;
		}

		let seconds = d.getUTCSeconds();
		if(seconds < 10) {
			seconds = `0${seconds}`;
		}

		return `[${ date } ${ months[d.getUTCMonth()] } ${ d.getUTCFullYear() } ${ hours }:${ minutes }:${ seconds }]`;
	};
})();

class Logger {
	constructor(prefix) {
		this.prefix = prefix;
	}

	verbose(msg, ...bits) {
		if (logLevel <= LEVELS.verbose) {
			this.log(msg, "verbose", ...bits);
		}
	}

	info(msg, ...bits) {
		if(logLevel <= LEVELS.info) {
			this.log(msg, "info", ...bits);
		}
	}

	warn(msg, ...bits) {
		if(logLevel <= LEVELS.warning) {
			this.log(msg, "warning", ...bits);
		}
	}

	error(msg, ...bits) {
		if(logLevel <= LEVELS.error) {
			this.log(msg, "error", ...bits);
		}
	}

	log(msg, level = "info", ...bits) {

		const printMsg = `${ now() } ${ COLORS[level](level) } ${ COLORS.prefix(this.prefix) } ${ msg ? format(msg, ...bits) : "" }`;
		if (consoleOutput) {
			console.log(printMsg);
		}

		logFilePaths.forEach(file => {
			fs.writeSync(file.fd, `${ printMsg }\n`);
			rotate(file);
		});
	}

	static setOptions(options) {
		if(options.level && !Number.isNaN(+options.level)) {
			let level = +options.level;

			if(level >= LEVELS.error) {
				level = LEVELS.error;
			} else if(level >= LEVELS.warning) {
				level = LEVELS.warning;
			} else if(level >= LEVELS.info) {
				level = LEVELS.info;
			} else {
				level = LEVELS.verbose;
			}

			logLevel = level;
		}

		if(typeof options.console === "boolean") {
			consoleOutput = options.console;
		}

		if(options.files && Array.isArray(options.files)) {
			options.files.forEach(function(logPath) {
				mkdirp.sync(path.dirname(logPath));
				logFilePaths.push({ path: logPath, fd: fs.openSync(logPath, "a+") });
			});
		}

		if(!Number.isNaN(+options.rotate)) {
			logRotateSize = +options.rotate;
		}
	}
}

module.exports = Logger;
