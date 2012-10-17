#!/usr/bin/env node

var fs     = require('fs');
var child  = require('child_process');
var prog   = require('commander');
var colors = require('colors');

prog.version("0.0.1");
prog.usage('[options] -- COMMAND [ARGS ...]')
prog.option('-w, --watch <target>', 'watch target','./');
prog.option('-C, --current <directory>', 'execute from directory','./');
prog.option('-u, --uptime <time>', 'minimum uptime for auto restart (seconds)', 1);
prog.option('-l, --logfile <file>', 'write to logfile');
prog.option('-d, --env <file>','load environmental variables from file','.env');
prog.parse(process.argv);

var watch = fs.realpathSync(prog.watch);
var cwd = fs.realpathSync(prog.current);
var min_uptime = parseInt(prog.uptime)*1000;

var args = prog.args;
var head;
var tail;
var watcher;

function proc(cmd,args,opts){
	
	var start = new Date().getTime();
	var run = child.spawn(cmd,args,opts);
	
	console.log("New Process Started with PID:",run.pid);
	
	run.on('exit',function(code){
		
		if(code==0){
			console.log("Process [%s] Exited Normally".green,run.pid);
		}else{
			console.error("Process [%s] Exited Abnormally".red,run.pid);
		}
		
		var end = new Date().getTime();
		
		if(end-start>min_uptime){
			proc(cmd,args,opts);
		}else{
			console.error("Process [%s] Did Not Meet Minimum Uptime - Not Restarting".red,run.pid);
		}
		
	});
	
	if(watcher){
		watcher.close();
	}
	
	watcher = fs.watch(watch,
			function(event,file){
				console.log("Watched Target Changed - Restarting".yellow);
				run.kill();
				proc(cmd,args,opts);
			});
}

function getenv(file){
	if(fs.existsSync(file)){
		console.log("Loading ENV File %s".magenta,file);
		var env = {};
		var data = fs.readFileSync(file).toString();
		
		data.split(/\n/).forEach(function(item){
			var items = item.split('=');
			if(items.length==2){
				var key = items[0].trim();
				var val = items[1].trim();
				env[key] = val;
				console.log("with: %s=%s",key,val);
			}
		});
		return env;
	}else{
		console.log("No ENV File Loaded".magenta);
		return {};
	}
}

function run(){
	console.log("Watching %s for changes".magenta,watch);
	console.log("Using cwd %s".magenta,cwd);
	console.log("Minimum Uptime Before Restart (seconds): %d".magenta,prog.uptime);
	var log = prog.logfile;
	var opts = {
		cwd   : cwd,
		stdio : ['pipe', process.stdout, process.stderr],
		env   : getenv(prog.env)
	}
	if(log){
		console.log("Use Log File %s: ".magenta,log);
		var fp = fs.openSync(log,'a');
		opts.stdio = ['pipe',fp,fp];
	}else{
		console.log("Writing to STDOUT".magenta);
	}
	head = args[0];
	tail = [];
	if (args.length>1){
		for(i=1;i<args.length;i++){
			tail.push(args[i]);
		}
	}
	console.log("Executing: %s with arguments: %s".bold.white,head,tail);
	proc(head,tail,opts);
}

if(args.length>0){
	run();
}else{
	prog.help();
}
