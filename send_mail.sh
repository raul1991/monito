#!/bin/bash
cat mail.txt | sed -e s/'${owner}'/"$2"/g -e s/'${active_users}'/"$3"/g -e s/'${machine}'/"$1"/g | curl --url 'smtps://smtp.gmail.com:465' --ssl-reqd  --mail-rcpt "$4" --upload-file - --user 'feedbacker1991@gmail.com:cafebabe1991' --insecure
