# Monito #

It monitors the servers on a network using a config file and reports the users that are currently logged in it.

### What is this repository for? ###

This repo is for Monito related development and issues.

### How do I get set up? ###

* Clone the project
* Pre-requisites
    - `pip` or `easy_install`
* Dependencies
	* sqlite3
	* python3
	* git-bash or bash
* Database configuration
* How to run the app
	* Clone the project
	* Install dependencies
		- `pip install -r dev-requirements.txt`
	* Give execute permissions to the script (fetch_machines.sh)
		- `chmod +x ./monito.sh`
	* Run the app
		- `python app.py`
	* Open the browser
		- `http://localhost:5000`
	* Create a csv file (without headers) with the following format
	    - hostname,owner name,username-to-use-to-login
	* Start the script
		- `./monito.sh -f /path/to/machinefile -k /path/to/ssh-key/file [-m <false/true>]`
	* Use `-h` for help menu
	* For simplicity, keep the machine file in the same directory as your project and save it .machines file.
* Adding machines
	* Append to machines file and restart the script in order to load them.