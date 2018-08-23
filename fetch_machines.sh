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
	team=$(echo "${m}" | awk '{split($0,tokens,","); print tokens[2]}')
	machine=$(echo "${machine}" | awk '{split($0,tokens,","); print tokens[1]}')
	echo "Running ${cmd} on ${machine}"

	#if [[ ${states["$machine"]} == "" ]];then
		
		result=$(ssh -o ConnectTimeout=10 -o BatchMode=yes -o StrictHostKeyChecking=no -t admin@${machine} ${cmd})
		isMachineUp=$?
		ips=()
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
		echo "Users available on ${machine} => $ips"
		addMachine $(join_by , "${ips}") "${machine}" "${team}"
	#fi
   done
}

function addKeys
{
  for m in ${machines}
  do
	machine=$(echo "${m}" | awk '{split($0,tokens,","); print tokens[1]}')
	team=$(echo "${m}" | awk '{split($0,tokens,","); print tokens[2]}')
	echo "Adding machine ${m} to team $team"
	addMachine "Free" "$machine" "$team"
	exits=$(cat ${HOME}/.ssh/known_hosts | grep "${machine}")
	exists=$?
	if [[ ${exists} -ne 0 ]];then
		echo "Running command => ssh-copy-id admin@${machine}"
		ssh-copy-id admin@${machine}
		isMachineUp=$?
	fi
  done
}

function addMachine
{
	# first argument - machine name
	# second argument - team name
	curl -X POST http://localhost:5000/mapping -F "team=$3" -F "vda_ips=$1" -F "machine_ip=$2" > /dev/null
}

addKeys
while true;
do
	getVisitors
	sleep 5
done
