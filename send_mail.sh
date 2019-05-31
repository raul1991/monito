#!/bin/bash

function send_email()
{
  cat "$1" | sed -e s/'${owner}'/"$2"/g -e s/'${active_users}'/"$4"/g -e s/'${machine}'/"$3"/g -e s/'${recipients}'/"$5"/g | /usr/sbin/sendmail -t
}

template_file="$1"
owner="$2"
machine="$3"
active_users="$4"
recipient="$5"

send_email "${template_file}" "${owner}" "${machine}" "${active_users}" "${recipient}"
