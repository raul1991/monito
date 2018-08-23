#!/bin/bash
if [[ -z $1 ]];then
	echo "Path to config file (*.machines file) is missing";
	exit
fi
machines=`cat $1`
cmd='who | grep -oE "([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+)"'
myHostName=`hostname`
function join_by { local IFS="$1"; shift; echo "$*"; }
function getVisitors
{
   	
   for machine in ${machines}
   do
	machine=$(echo "${machine}" | awk '{split($0,tokens,","); print tokens[1]}')
	echo "Running ${cmd} on ${machine}"

	#if [[ ${states["$machine"]} == "" ]];then
		
		result=$(ssh -t admin@${machine} ${cmd})
		isMachineUp=$?
		ips=()
		isAnyOtherUser="false"
		for user in ${result}
		do
			shopt -s nocasematch
			if [[ ! "$user" =~ $myHostName.* ]];then
				ips+=("${user}")
			fi
			shopt -u nocasematch
		done
		if [[ $isMachineUp -ne 0 ]];then
			ips=("Unable to connect"); 
		else
			if [[ $ips == "" ]];then
				ips="Free";
			fi
		fi
		curl -X POST http://localhost:5000/mapping -F "vda_ips=$(join_by , "${ips}")" -F "machine_ip=${machine}"
	#fi
   done
}

function addKeys
{
  for m in ${machines}
  do
	machine=$(echo "${m}" | awk '{split($0,tokens,","); print tokens[1]}')
	team=$(echo "${m}" | awk '{split($0,tokens,","); print tokens[2]}')
	echo "team - $team"
	addMachine "$machine" "$team"
	exits=$(cat ${HOME}/.ssh/known_hosts | grep "${machine}")
	exists=$?
	if [[ ${exists} -ne 0 ]];then
		echo "Adding keys for machine - ${machine}"
		echo "Running command - ssh-copy-id admin@${machine}"
		ssh-copy-id admin@${machine}
		isMachineUp=$?
	fi
  done
}

function addMachine
{
	# first argument - machine name
	# second argument - team name
	curl -X POST http://localhost:5000/mapping -F "team=$2" -F "vda_ips=Free" -F "machine_ip=$1"
}

addKeys
while true;
do
	getVisitors
	sleep 5
done
