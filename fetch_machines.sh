#!/bin/bash
machines=`cat machines.txt`
cmd='who | grep -oE "([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+)"'
myHostName=`hostname`
# dictonary for machine states
states=()
function join_by { local IFS="$1"; shift; echo "$*"; }
function getVisitors
{
   	
   for machine in ${machines}
   do
	addMachine "${machine}"
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
  for machine in ${machines}
  do
	cat machines.txt | grep "${machine}"
	exists=$?
	if [[ ${exists} -ne 0 ]];then
		echo "Adding keys for machine - ${machine}"
		ssh-copy-id ${username}@${machine}
		isMachineUp=$?
		if [[ ${isMachineUp} == 0 ]];then
			${states["${isMachineUp}"]}="true"
		else
			${states["${isMachineUp}"]}="false"
		fi
	fi
  done
}

function addMachine
{
	states["$1"]=""
}

addKeys
while true;
do
	getVisitors
	sleep 5
done
