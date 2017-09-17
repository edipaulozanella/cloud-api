var plan = require('flightplan');
var appName = 'app';
// var username = 'root';
var username = 'deploy';
var startFile = 'name';//na raiz
var tmpDir = ""+ appName;

// configuration
plan.target('staging', [
  {
    host: '168.235....177',
    username: username,
    // privateKey: './.shh/id_rsa',
    password: 'password',//
    agent: process.env.SSH_AUTH_SOCK
  }
]);

plan.target('production', [
  {
    host: '168.235....177',
    username: username,
    // privateKey: './.shh/id_rsa',
    password: 'password',//
    agent: process.env.SSH_AUTH_SOCK
  },
]);

// run commands on localhost
plan.local(function(local) {
  // local.exec('gulp build');
  console.log(process.env.SSH_AUTH_SOCK);
  local.log('Copy files to remote hosts');
  // local.exec('find .', {exec: {maxBuffer: 10000*1024}});
  var filesToCopy = local.exec('git ls-files', {silent: true});
  console.log(filesToCopy);
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on remote hosts (destinations)

// run commands on remote hosts (destinations)
plan.remote(function(remote) {
  var path = ' ~/'+startFile+"/app";
  var temp = ' ~/temp/'+startFile+"/"+tmpDir;
  console.log(temp,path);
  remote.log('Move folder to root');

  remote.sudo('mkdir -p ~/'+startFile, {user: username});
  remote.sudo('mkdir -p ~/temp', {user: username});
  remote.sudo('mkdir -p ~/temp/'+startFile, {user: username});

  remote.sudo('cp -R /tmp/' + tmpDir + '/ ~/temp/'+startFile, {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  // remote.log('Install dependencies');
  // remote.sudo('npm --production --prefix ' + temp + ' install ' + temp, {user: username});

  remote.log('copy application');
  // remote.sudo('ln -snf ' + temp + '/ '+path, {user: username});///recoratr e colar
  // remote.rm('-rf ~/'+startFile+"/app");
  remote.sudo('cp -rf ' + temp + '/*  ~/'+startFile+"/app" , {user: username});

  remote.rm('-rf ' + temp);

});
