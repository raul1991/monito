#!/bin/bash

. ./.env
USE_GMAIL=${USE_GMAIL:-false}
function send_email()
{
  if [[ ${USE_GMAIL} == "true" ]]; then
      echo "Using gmail smtp server"
      cat "$1" | sed -e s/'${owner}'/"$2"/g -e s/'${active_users}'/"$4"/g -e s/'${machine}'/"$3"/g | curl -s --url 'smtps://smtp.gmail.com:465' --ssl-reqd  --mail-rcpt "$5" --upload-file - --user "$(echo ${GMAIL_CREDS} | base64 -d)" --insecure
  else
      cat "$1" | sed -e s/'${owner}'/"$2"/g -e s/'${active_users}'/"$4"/g -e s/'${machine}'/"$3"/g -e s/'${recipients}'/"$5"/g | /usr/sbin/sendmail -t
  fi
}

template_file="$1"
owner="$2"
machine="$3"
active_users="$4"
recipient="$5"

send_email "${template_file}" "${owner}" "${machine}" "${active_users}" "${recipient}"
