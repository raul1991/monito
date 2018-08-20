#!/bin/bash
machines=`cat machines.txt`
cmd='who | grep -oE "([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+)"'
myHostName=""
function getVisitors
{
   	
   for machine in ${machines}
   do
	echo "Running ${cmd} on ${machine}"
	result=$(ssh -t admin@${machine} ${cmd})
	for user in ${result}
	do
	   echo "check user ${user}"	
	   if [[ $user == *w7p333.* ]];then
		   echo "You exist there"
	   else
		   ips+="${user},"
	   fi
	   curl -X POST http://localhost:5000/mapping -F "vda_ips=${users}" -F "machine_ip=${machine}"
	done
   done
}

getVisitors
