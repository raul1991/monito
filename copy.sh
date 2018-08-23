#!/bin/bash
for i in $(cat machines.txt.team)
do
	machine=$(echo "${i}" | awk '{split($0,tokens,","); print tokens[1]}')
	echo $machine
	ssh-copy-id admin@$machine

done
