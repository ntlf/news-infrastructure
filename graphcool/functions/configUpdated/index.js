const Client = require('ssh2').Client;

module.exports = function(event, cb) {
  const conn = new Client();
  conn
    .on('ready', () => {
      conn.exec(
        'replace_me/docker/news-please/np-restart.sh',
        (err, stream) => {
          if (err) throw err;
          stream
            .on('close', (code, signal) => {
              console.log(
                `Stream :: close :: code: ${code}, signal: ${signal}`
              );
              conn.end();
              cb();
            })
            .on('data', data => {
              console.log(`STDOUT: ${data}`);
              conn.end();
              cb();
            })
            .stderr.on('data', data => {
              console.log(`STDERR: ${data}`);
              conn.end();
              cb();
            });
        }
      );
    })
    .connect({
      host: 'replace_me',
      port: 22,
      username: 'replace_me',
      privateKey: `replace_me`
    });
};
