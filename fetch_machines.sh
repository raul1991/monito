#!/bin/bash

# variables for the script
key_file="" #for ssh key file. Must the absolute path
machines="" # for file that consists of host,team,username separated by comma.

cmd='who | grep -oE "([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+)"' # run the who command and grep on the ip or host name.
myHostName=`hostname`
shouldAddMachines="true"


function join_by { local IFS="$1"; shift; echo "$*"; }
function getVisitors
{
	machine="$1"
	team="$2"
	user="$3"
	echo "Running ${cmd} on ${machine}"

		
		result=$(ssh -q -i "${key_file}" -o ConnectTimeout=10 -o BatchMode=yes -o StrictHostKeyChecking=no -t ${user}@${machine} ${cmd})
		isMachineUp=$?
		ips=()
		for visitor in ${result}
		do
			shopt -s nocasematch
			if [[ ! "$visitor" =~ $myHostName.* ]];then
				ips+=("${visitor}")
			fi
			shopt -u nocasematch
		done
		if [[ $isMachineUp -ne 0 ]];then
			ips=("Unable-To-Connect");
		else
			if [[ $ips == "" ]];then
				ips="Free";
			fi
		fi
		echo "Users found on $machine === > $ips"
		addMachine $(join_by , "${ips}") "${machine}" "${team}"
}

function addMachines
{
  for m in $(cat $1)
  do
       machine=$(echo "${m}" | awk '{split($0,tokens,","); print tokens[1]}')
       team=$(echo "${m}" | awk '{split($0,tokens,","); print tokens[2]}')
       echo "Adding machine ${m} to team $team"
       addMachine "Free" "$machine" "$team"
  done
}

function addMachine
{
	# first argument - machine name
	# second argument - team name
	curl -X POST http://localhost:5000/mapping -F "owner=$3" -F "vda_ips=$1" -F "machine_ip=$2" > /dev/null&
}

function showValidOptions
{
	echo "-f      -> comma separated file with machine,owner,username"
	echo "-k      -> absolute path to the ssh key (without the .pub and in double quotes)"
	echo "-m      -> a flag to tell the script if it should add machines or not in the database. Provide this only if you have not added a new machine"
	echo "-h      -> to show help for this script"

}

function parseArgs
{
	local OPTIND
	echo "Arguments $@"
	while getopts ":f:k:m:" opt; do
	case $opt in
		f ) # machine file
			machines="$OPTARG"
			;;
		k ) # ssh key file
			key_file="$OPTARG"
			;;
		m) # flag to add machines or not
			shouldAddMachines="$OPTARG"
			;;
		h) # help menu
			showValidOptions
			;;
		:)
			echo "Option -$OPTARG requires an argument" >&2
			exit 1
			;;
		\?) # error scenario
			echo "Invalid option -$OPTARG" >&2
			showValidOptions
			;;
	esac
	done
	shift $((OPTIND-1))
}

parseArgs "$@"

[[ $shouldAddMachines == "false" ]] && echo "Machines will not be added" || addMachines "$machines"

while true;
do
	for line in $(cat $machines)
	do
		machine=$(echo "$line" | awk '{split($0,arr,",");print arr[1]}')
		team=$(echo "$line" | awk '{split($0,arr,",");print arr[2]}')
		user=$(echo "$line" | awk '{split($0,arr,",");print arr[3]}')
		getVisitors "$machine" "$team" "$user"
		sleep 5
	done
done
