#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

if [[ -z "$1" ]]; then
  echo "No config provided"
else
  source $1
fi

domainPrefix="$(head -n 1 $PREFIX_FILE)"
if [ -f "$PREVIOUS_PREFIX_FILE" ]; then
  old_prefix=$(cat "$PREVIOUS_PREFIX_FILE")
fi
echo $domainPrefix > $PREVIOUS_PREFIX_FILE
echo $domainPrefix

# Have a file named as the prefix but with .tmp as ending
prefix_ending=${PREFIX_FILE##*.}
TMP_PREFIX="${PREVIOUS_PREFIX_FILE%$prefix_ending}tmp" 
echo $TMP_PREFIX

new_domain_1=${domainPrefix}.dona.tf.uni-bielefeld.de
new_domain_2=www.${domainPrefix}.dona.tf.uni-bielefeld.de
echo $new_domain_1 $new_domain_2

# Save current URL to file for later lookup
echo "https://${new_domain_1}" > $URL_SAVE_LOCATION
echo $URL_SAVE_LOCATION

# Remove the first line of the prefix file 
tail -n +2 $PREFIX_FILE > $TMP_PREFIX && mv $TMP_PREFIX $PREFIX_FILE

# Copy the current nginx config so that the old URLs are still valid
scp ${NGINX_CONF} ${NGINX_CONF}_previous
cat ${NGINX_CONF}_previous

# Replace all occurences of old URLs in the nginx config with the new ones (should be three)
sed_match_str="[a-zA-Z0-9\-]*.dona.tf.uni-bielefeld.de"
sudo sed -i s/" ${sed_match_str} www.${sed_match_str}"/" ${new_domain_1} ${new_domain_2}"/g $NGINX_CONF
sudo sed -i s/"= ${sed_match_str}"/"= ${new_domain_1}"/g $NGINX_CONF
sudo sed -i s/"= www.${sed_match_str}"/"= ${new_domain_2}"/g $NGINX_CONF

cat $NGINX_CONF

if [ -z "$REMOVE_OLD_PREFIXES_FROM_CERT" ]; then
  previous_domains=$(sudo certbot certificates 2>/dev/null | grep 'Domains' | cut -d':' -f2 | sed -e 's/ /,/g' | perl -pe 's/\n//' | cut -c2- )
else
  # Somewhat dangerous as the last regex removes all URLs that have exactly 8 characters before the first dot (excluding www.)
  previous_domains=$(sudo certbot certificates 2>/dev/null | grep 'Domains' | cut -d':' -f2 | sed -e 's/ /,/g' | perl -pe 's/\n//' | cut -c2- | perl -pe 's/(,)+((www\.)?[a-z0-9]{8}\.[^,]+)//g')
fi

# If there is a previous domain prefix, keep it in the certificate
if [ -z "$old_prefix" ]; then
  domains_list="${previous_domains},${new_domain_1},${new_domain_2}"
else
  domains_list="${previous_domains},${new_domain_1},${new_domain_2},${old_prefix}.dona.tf.uni-bielefeld.de,www.${old_prefix}.dona.tf.uni-bielefeld.de"
fi

sudo certbot --expand -d $domains_list
