# ![Monito](rest-api/static/images/Monito-1-dark.png) #

It monitors the servers on a network using a config file and reports the users that are currently logged in it.

# What is this repository for?

This repo is for Monito related development and issues. This app has not been tested on windows os.

# How does it work ?
So the pinger python script runs a ping script that pings multiple machines at once
using fabric and updates some metrics from the machines into the database (sqlite3).
The dashboard is another flask app that you should start separately for viewing those
metrics and doing other management stuff with those machines.

# Why would I need this app ?
You manage a team or work in one and you guys keep track of machines' ownerships, current users
machine/resource in your teams manually or inefficiently. This might be a good use case for using
monito.
I use it for the same purpose and infact made it because of this reason as well.

# Pre-requisites
    - `pip` or `easy_install`
    - Create a shared secret key for your machines in order to allow anonymous ssh login to monito.
# Dependencies
	* python3
	* linux os
# How to setup the app
	* Clone the project
	* Download virtualenvwrapper
	    - `pip install virtualenvwrapper`
	* Create new virtual environment
	    - `mkvirtualenv monito`
    * Shift to the environment
        - `source ~/.virtualenvs/monito/bin/activate`
	* Install dependencies
		- `pip install -r dev-requirements.txt`
	* Create a csv file (without headers) with the following format
        - hostname,owner name,username-to-use-to-login
    * Run the dashboard app
        - `python app.py`
    * Export these environment variables for the pinger script
        - `export SERVERS_PASSWORD=PASSWORDS_YOU_USE_TO_ACCESS_SERVERS` (optional)
        The below env variable if not provided, this (${HOME}/.ssh/id_rsa.pub) will be used.
        - `export PRIVATE_KEY=/path/to/home/.ssh/id_rsa.pub`
    * Run the script for getting the live users
        - `cd pinger/api && python Ping.py ../resources/config.ini`
# Technical diagram
<p align="center">
    <img src="monito-diagram.png"/>
</p>

# Misc
    * Open `http://localhost:5000` for viewing the dashboard.

# See it all in action
    * Have multiple users use this app
    * Let them update their machines using the dashboard
    * Ask someone to trespass the machines, see the tresspassers being updated on the gui.
    * Allocate/release machines
    * Emails will be triggered using send mail for trespassing (commented out) & allocation, so make sure that is in place
