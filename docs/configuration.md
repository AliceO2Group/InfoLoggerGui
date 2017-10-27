# Configuration

After installation (dev or prod) you need to configure the application to works in its environement.

## Register CERN OAuth

1. Go https://sso-management.web.cern.ch/OAuth/RegisterOAuthClient.aspx
1. client_id is whatever you want
1. redirect_uri is like https://hostname:port/callback
1. Generate and put the secret to your config.js
1. submit request

## Config file

```bash
cd /opt/InfoLoggerGui
cp config-default.js config.js
vim config.js
systemctl restart infologgergui
systemctl status infologgergui # check
# Done, go to the HTTPS link :)
```

Path  | Description
------------- | -------------
oAuth.secret | password from your oauth registration
oAuth.id | login from your oauth registration
oAuth.redirect_uri | the URL of this application like https://hostname:port/callback
http.hostname | should be the one from redirect_uri
infoLoggerServer.{host,port} | empty if you don't want to use
mysql.{host,user,password} | empty if you don't want to use

Other fields should be ok by default for your configuration at CERN.

If you change the public ports (8080 and 8443), you need change it on your firewall:

```bash
# add ports
firewall-cmd --zone=public --add-port=8443/tcp --add-port=8080/tcp --permanent

# list ports
firewall-cmd --list-all

# remove ports
firewall-cmd --zone=public --remove-port=8443/tcp --remove-port=8080/tcp --permanent
```

## Certificates (dev only)

You need a certificate to access the app via HTTPS, this is mandatory. This is automatic when you install a package.

```bash
cd /opt/InfoLoggerGui
mkdir cert
openssl req -nodes -x509 -newkey rsa:4096 -keyout cert/key.pem -out cert/cert.pem -days 365 -subj "/C=CH/ST=Geneva/L=Meyrin/O=CERN"
```
