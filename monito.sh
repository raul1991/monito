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
		ssh ${user}@${machine} -q -i "${key_file}" -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o BatchMode=yes exit
		isMachineUp=$?
	if [[ $isMachineUp -ne 0 ]];then
		echo "Machine is down"
		ips='-'
	else
		result=$(ssh ${user}@${machine} -q -i "${key_file}" -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o BatchMode=yes -t ${cmd})
		ips=()
		for visitor in ${result}
		do
			shopt -s nocasematch
			if [[ ! "$visitor" =~ $myHostName.* ]];then
				ips+=("${visitor}")
			fi
			shopt -u nocasematch
		done
		if [[ $ips == "" ]];then
			ips="-";
		fi
		echo "Users found on $machine === > $ips"
	fi
	updateMachine $(join_by , "${ips}") "${machine}" "${team}"

}

function addMachines
{
  while IFS=, read -u10 machine owner
  do
       addMachine "-" "$machine"
  done 10<"$1"
}

function addMachine
{
	# first argument - machine name
	# second argument - team name
	curl -s -X POST http://localhost:5000/mapping -F "owner=$1" -F "vda_ips=$1" -F "machine_ip=$2" > /dev/null
}

function updateMachine
{
	# first argument - machine name
	# second argument - team name
	curl -s -X POST http://localhost:5000/mapping -F "vda_ips=$1" -F "machine_ip=$2" -F "owner=$3" > /dev/null
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
      exit 1
			;;
	esac
	done
	shift $((OPTIND-1))
}

parseArgs "$@"

[[ "${shouldAddMachines}" == "false" ]] && echo "Machines will not be added" || addMachines "$machines"

while true;
do
	while IFS=, read -u10 machine owner login_name
	do
		getVisitors "$machine" "$owner" "$login_name"
	done 10<"${machines}"
done
