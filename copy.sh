#!/bin/bash
for i in $(cat team.machines)
do
	machine=$(echo "${i}" | awk '{split($0,tokens,","); print tokens[1]}')
	echo $machine
	ssh-copy-id admin@$machine

done
