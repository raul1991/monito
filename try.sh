#!/bin/sh
 
(
echo "To: " $1
echo "From: Monito <no-reply@ericsson.com>"
echo "Subject: Unauthorized access to $2"
echo "Content-Type: text/html"
echo
echo "The following users recently access your machine ($2)."
echo
echo "$3"
echo
) | /usr/sbin/sendmail -t
