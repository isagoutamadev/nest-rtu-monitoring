import { BooleanNumber } from 'src/interfaces/base-entity.interface';
import { Ssh } from './ssh';

type MdConfigTelegrafRtu = {
    ip_address: string;
    sname: string;
    is_virtual: BooleanNumber;
    configs: {
        filename: string;
        content: string;
    }[];
};

export class MdSsh {
    static async generateRtuTelegrafConfigs(md: MdConfigTelegrafRtu) {
        const server = await Ssh.connect(md.ip_address);
        try {
            for (let i = 0; i < md.configs.length; i++) {
                const config = md.configs[i];
                const filename = config.filename;
                let directory = '';
                if (md.is_virtual == 1) {
                    directory = `/etc/telegraf/configs/${md.sname}/telegraf.d/${filename}`;
                } else {
                    directory = `/etc/telegraf/telegraf.d/${filename}`;
                }
    
                let command = `printf '${config.content}' | sudo tee ${directory}`;
                await Ssh.execSSH(server, command);
                console.log('success', directory);
            }

            const waitForString = 'Successfull reload config';
            await Ssh.execSSH(
                server,
                `sudo docker exec -t ${md.sname} bash -c "kill -HUP 1\necho '${waitForString}'"`,
                {
                    timeout: 5000,
                    successString: waitForString,
                }
            );

            server.end();
            server.destroy();
        } catch (error) {
            server.end();
            server.destroy();
            throw error;
        }
    }
}
