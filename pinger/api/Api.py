import json

import requests


class MachineRequest(object):

    def __init__(self, machine: str, visitors: [], actual_owner: str) -> None:
        self.machine = machine
        self.visitors = visitors if visitors else "-"
        self.actual_owner = actual_owner

    def __repr__(self) -> str:
        return "Machine: {}, owned by: {}, visitors on it : {}".format(self.machine, self.actual_owner, self.visitors)


class Api(object):
    def __init__(self, config: {}) -> None:
        print("Monito api initialised")
        self.host = config['host']
        self.port = config['port']
        self.base_url = "http://{host}:{port}".format(host=self.host, port=self.port)

    def update_mapping(self, request: MachineRequest):
        try:
            response = requests.post(self.base_url + "/mapping", data=json.dumps({
                'vda_ips': request.visitors,
                'machine_ip': request.machine,
                'owner': request.actual_owner
            }), headers={'content-type': 'application/json'})
            print(response)
        except Exception as e:
            print("Error executing the post request", e)

    def exits(self, machine_ip):
        try:
            response = requests.get(self.base_url + "/machine/" + machine_ip)
            if response.status_code == 200:
                return response
            else:
                return None
        except Exception as e:
            print("Error executing the post request", e)
