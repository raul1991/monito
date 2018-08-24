# Monito #

It monitors the servers that you provide it using a config file and reports the users that are currently logged in it.

### What is this repository for? ###

This repo is for Monito related development and issues.

### How do I get set up? ###

* Clone the project
* Run the flask app 
	`python app.py`
* Dependencies
	* sqlite3
	* python3
	* git-bash or bash
* Database configuration
* How to run the app
	* Clone the project
	* pip install -r dev-requirements.txt
	* Give execute permissions to the script (fetch_machines.sh)
	* Run the app
		python app.py
	* Open the browser
		http://<host-name>:5000
	* Create a csv file (without headers) with hostnames and team-names separated by comma on each line.
	* Start the script
		./fetch_machines.sh /path/to/machinefile
	* Make sure to keep the machine file in the same directory as your project.