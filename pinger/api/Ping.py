import json
import time

import sys

from pinger.api.Api import Api, MachineRequest
from pinger.api.CommandRunner import CommandRunner
from pinger.api.ConfigFileParser import ConfigFileReader


class Init(object):
    def __init__(self) -> None:
        print("Starting up the pinger process")
        self.configuration = self.load_config(sys.argv[1])
        self.machine_config = self.configuration.get_machines_config()
        self.api_config = Api(self.configuration.get_api_config())
        self.ping_machines()

    def load_config(self, filename: str) -> ConfigFileReader:
        print("Loading the configuration from the file: {filename}".format(filename=filename))
        return ConfigFileReader(filename=filename)

    def ping_machines(self):
        runner = CommandRunner(config=self.machine_config)
        runner.prepare_connection_strs()
        while True:
            for req in runner.perform_parallel_run():
                try:
                    json.loads(self.api_config.exits(req['machine']).text)
                except Exception as e:
                    print("Something went wrong parsing the response", e)
                request = self.to(req)
                self.api_config.update_mapping(request=request)
            time.sleep(10)

    @staticmethod
    def to(obj: {}) -> MachineRequest:
        print("Converting result {result} from ssh server into machine object".format(result=obj))
        return MachineRequest(machine=obj['machine'], visitors=obj['vda_ips'], actual_owner=obj['owner'])


if __name__ == '__main__':
    print("Starting up the Init script for pinging the servers")
    Init()
