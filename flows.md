# Admin creation flow

* Admin registrates on Beame Authorization server and gets token via email
* Additional FQDNs generated for: Authorization server, Whisperer, Matching server, Adminstration panel?
* Admin bootstraps Beame Insta Server
* Admin starts Beame Insta Server component called **Gateway Server**
* Admin (or Gateway Server?) starts Beame Insta Server component called **Authorization Server**
* Admin navigates Browser to the Gateway Server
* Gateway Server detects that admin is not set up yet
* Gateway Server proxies the connection to Authorization Server
* Authorization server displays QR, starting provisioning flow
* ... ( provisioning flow ) ...
* Authorization server receives end-of-provisioning notification and records admin

# Registration flow
* Browser surfs to customer authorization server
* Customer authorization server - does custom things to authenticate the user
* Customer authorization server sends user data (name, email, external user id) to gateway server
* Gateway server sends (via customer authorization server): URL for accessing registration server (URL has proxying token + encrypted user data)
* Browser redirects to given URL (gateway server entry point)
* Gateway server processes proxying token and sets proxying-enabler-session-cookie
* Browser redirects to given URL (gateway server which proxies to authorization service)


# Login flow

* Browser navigates to Gateway Server
* Gateway Server detects no cookie and no token and proxies the connection to login server (Authorization?)
* ... ( login flow ) ...
* ???
* Applications list is shown on the mobile device that was used to log in. Admin has additional **Admin Panel** application as possible choice.

# Service usage flow

* Browser navigates (or more likely is redirected) to the Gateway Server
* Signed token is detected (if it's not in cookie, put it into cookie on reposonse) and validated
* Application ID or URL is extracted from the token
* Connection is proxied to the appropriate service

# Insta server management flow

( Based on service usage flow )

* Browser navigates (or more likely is redirected) to the Gateway Server
* Signed token is detected (if it's not in cookie, put it into cookie on reposonse) and validated. Token contains special "is admin" flag.
* Application ID or URL is extracted from the token
* If "is admin" flag is set, connection can be proxied to the admin panel if requested


# Open issues

* Package?
