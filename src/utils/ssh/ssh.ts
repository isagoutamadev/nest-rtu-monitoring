import { readFileSync } from 'fs';
import { BASE_PATH } from 'src/basepath';
import { Client } from 'ssh2';

export class Ssh {
    static connect = (ip: string): Promise<Client> =>
        new Promise((resolve, reject) => {
            const keyPath = BASE_PATH +'/config/ssh.key';
            const conn = new Client();
            conn.on('ready', () => {
                console.log('Client :: ready ' + ip);
                return resolve(conn);
                // return conn;
            })
                .on('error', (error) => {
                    console.log('Client :: error ' + ip);
                    console.error(error);
                    reject(error);
                })
                .connect({
                    host: ip,
                    port: 22,
                    username: process.env.SSH_USER ?? 'superos',
                    privateKey: readFileSync(keyPath),
                });
        });

    static execSSH = (
        ssh: Client,
        cmd: string,
        option?: {
            timeout: number;
            successString: string;
        },
    ) =>
        new Promise((resolve, reject) => {
            const execAt = Date.now();

            ssh.exec(cmd, (err, stream) => {
                if (err) reject(err);
                stream
                    .on('close', (code, signal) => {
                        //   console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                        resolve(true);
                        //   ssh.end();
                        //   ssh.destroy();
                    })
                    .on('data', (data) => {
                        console.log(
                            'STDOUT: OK' + String(data).substring(0, 40),
                        );
                        if (option) {
                            if (option.timeout && option.successString) {
                                if (String(data).includes(option.successString)) {
                                    return resolve(true);
                                }
    
                                if (-(execAt - Date.now()) >= option.timeout) {
                                    return reject('timeout: ' + String(data));
                                }
                            } else {
                                resolve(true);
                            }
                        } else {
                            resolve(true);
                        }
                        //   reject(data);
                    })
                    .stderr.on('data', (data) => {
                        console.log('STDERR: ' + String(data));
                        reject(String(data));
                    });
            });
        });
}
