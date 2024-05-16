#!/bin/bash

domainPrefix="$(head -n 1 /home/phillmann/changingDomainFiles/domainPrefixes.csv)"
printf "https://${domainPrefix}.dona.tf.uni-bielefeld.de" > /home/phillmann/currentDomainPrefix.txt
tail -n +2 "/home/phillmann/changingDomainFiles/domainPrefixes.csv" > "/home/phillmann/changingDomainFiles/domainPrefixes.tmp" && mv "/home/phillmann/changingDomainFiles/domainPrefixes.tmp" "/home/phillmann/changingDomainFiles/domainPrefixes.csv"

sudo sed -i s/" [a-zA-Z0-9\-]*.dona.tf.uni-bielefeld.de www.[a-zA-Z0-9\-]*.dona.tf.uni-bielefeld.de"/" ${domainPrefix}.dona.tf.uni-bielefeld.de www.${domainPrefix}.dona.tf.uni-bielefeld.de"/g /etc/nginx/sites-available/changingDomainsDona

sudo sed -i s/"= [a-zA-Z0-9\-]*.dona.tf.uni-bielefeld.de"/"= ${domainPrefix}.dona.tf.uni-bielefeld.de"/g /etc/nginx/sites-available/changingDomainsDona

sudo sed -i s/"= www.[a-zA-Z0-9\-]*.dona.tf.uni-bielefeld.de"/"= www.${domainPrefix}.dona.tf.uni-bielefeld.de"/g /etc/nginx/sites-available/changingDomainsDona

sudo certbot --expand -d "$(sudo certbot certificates 2>/dev/null | grep 'Domains' | cut -d':' -f2 | sed -e 's/ /,/g' | perl -pe 's/\n//' | cut -c2- | perl -pe 's/(,)+((www\.)?[a-z0-9]{8}\.[^,]+)//g'),${domainPrefix}.dona.tf.uni-bielefeld.de,www.${domainPrefix}.dona.tf.uni-bielefeld.de"
