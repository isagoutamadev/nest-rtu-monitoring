import { BooleanNumber } from 'src/interfaces/base-entity.interface';
import { Ssh } from './ssh';

type RrdConfigPrometheusRtu = {
    ip_address: string;
    configs: {
        filename: string;
        content: string;
    }[];
};

export class RrdSsh {
    static async generateAlertConfigs(rrd: RrdConfigPrometheusRtu) {
        const server = await Ssh.connect(rrd.ip_address);
        try {
            for (let i = 0; i < rrd.configs.length; i++) {
                const config = rrd.configs[i];
                const filename = config.filename;
                const directory = `/etc/prometheus/rules/${filename}`;
                const successMessage = 'Success creating ' + filename;
    
                const command = `printf '${config.content}' | sudo tee ${directory} && echo ${successMessage}`;
                await Ssh.execSSH(server, command, {
                    timeout: 5000,
                    successString: successMessage
                });
                console.log('success', directory);
            }

            server.end();
            server.destroy();
        } catch (error) {
            server.end();
            server.destroy();
            throw error;
        }
    }
}
