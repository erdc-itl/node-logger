# Simple Logger

## Installation
```
npm install @erdc-itl/simple-logger
```

## Usage

```javascript
var Logger = require("simple-logger");
var trainingLog = new Logger("training");
var reportLog = new Logger("reporting");

trainingLog.verbose("Hello!");
trainingLog.info("Information");
reportLog.warn("WARNING!");
reportLog.error("IT ALL BROKE!!!");
```

The only argument to the Logger constructor is the name applied in log messages.  You can create multiple loggers within your app to distinguish different parts of the app from each other.

The above code will result in a log that looks something like this:

```
[5 May 2015 14:32:00] 📢 verbose training Hello!
[5 May 2015 14:32:01] ℹ️ info training Information!
[5 May 2015 14:32:02] ⚠️ warn reporting WARNING!
[5 May 2015 14:32:03] ⛔️ error reporting IT ALL BROKE!
```

Except it'll be colorful.

## Configuration

The logger has some simple options that can be set globally, including the log level, output files, and log rotation options.

```javascript
var Logger = require("simple-logger");
Logger.setOptions({
	level: 10,
	console: true,
	files: [ "/logs/my.log" ],
	rotate:  1024
});
```

The options are:

|Name|Description|
|---|---|
|level|The level is a number that determines the minimum log messages to output.  The levels are 10 (verbose), 20 (info), 30 (warning) and 40 (error).  Defaults to info.|
|console|Boolean indicating whether to write the log to the console.  Defaults to true.|
|files|Array of string paths to write the log to.  If any of the paths don't exist, they will be created.  Defaults to no file.|
|rotate|File size, in bytes, at which to rotate the log.  When the log file exceeds this size, it is compressed and renamed, and a new log file created.  0 will disable rotate.  Defaults to 0.|
