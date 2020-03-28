import configparser


class ConfigFileReader(object):

    def __init__(self, filename='config.ini') -> None:
        self.config = {}
        print("Reading file: {filename}".format(filename=filename))
        self.config_parser = configparser.ConfigParser()
        self.config_parser.read(filename)
        for s in self.config_parser.sections():
            self.config[s] = {}
            for keys in self.config_parser[s]:
                self.config[s][keys] = self.config_parser[s][keys]
        print(self.config)

    def get_config(self, key: str) -> {}:
        return self.config[key]

    def get_machines_config(self) -> {}:
        return self.get_config("pinger")

    def get_api_config(self) -> {}:
        return self.get_config("api")
