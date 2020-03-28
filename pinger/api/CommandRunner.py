import json

from fabric import ThreadingGroup


class CommandRunner(object):
    def __init__(self, config):
        print("Command runner initialized")
        self.config = config
        self.machines_file = config['machines']
        self.cmd = config['command']

    def perform_parallel_run(self) -> []:
        results = []
        hosts = self.prepare_connection_strs()
        if len(hosts) == 0:
            print("No machine found")
            return
        print("Running cmd: {cmd}".format(cmd=self.cmd))
        try:
            for connection in ThreadingGroup(*hosts):
                results.append({"machine": connection.host, "owner": "-", "vda_ips": self.format_result(connection)})
        except Exception as e:
            print("Something went wrong during ssh", e)
        return results

    def format_hosts(self, machine_config):
        return "{user}@{host}:{port}".format(user=machine_config['user'],
                                             host=machine_config['host'],
                                             port=machine_config['port'])

    def prepare_connection_strs(self) -> []:
        hosts = []
        with open(self.machines_file, "r") as f:
            data = json.load(f)
        for d in data:
            hosts.append(self.format_hosts(d))
        return hosts

    def format_result(self, connection):
        try:
            result = connection.run(self.cmd, hide="both", pty=True)
            if result.exited == 0:
                return result.stdout.strip()
            else:
                print(result.stderr)
                return "-"
        except Exception as e:
            print("Command {cmd} could not be run on {host}".format(cmd=self.cmd, host=connection['host']))
