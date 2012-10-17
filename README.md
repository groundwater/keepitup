# Keeping it Up

Usage:

	Usage: keepitup [options] -- COMMAND [ARGS ...]

	Options:

	  -h, --help                 output usage information
	  -V, --version              output the version number
	  -w, --watch <target>       watch target
	  -C, --current <directory>  execute from directory
	  -u, --uptime <time>        minimum uptime for auto restart (seconds)
	  -l, --logfile <file>       write to logfile
	  -d, --env <file>           load environmental variables from file

Example:

	keepitup --logfile /tmp/my.log -- node my/script.js

Keepitup does _not_ daemonize,
it monitors and restarts a single process should it exit.

Keepitup supports some basic but useful options,
like redirecting STDOUT to a log file.

