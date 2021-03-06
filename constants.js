/**
 * Created by zenit1 on 10/11/2016.
 */
"use strict";

const path = require('path');
const os   = require('os');
const home = process.env.BEAME_GATEKEEPER_DIR || os.homedir();

const EnvProfile = {
	Name:        'Prod',
	FqdnPattern: '.p.'
};


const GatewayControllerPath     = '/beame-gw';
const XprsSigninPath            = `${GatewayControllerPath}/xprs-signin`;
const SigninPath                = `${GatewayControllerPath}/signin`;
const DCLSOfflinePath           = `${GatewayControllerPath}/offline`;
const LoginPath                 = `${GatewayControllerPath}/login`;
const LogoutPath                = `${GatewayControllerPath}/logout`;
const ClientLogoutPath          = `${GatewayControllerPath}/client-logout`;
const ConfigData                = `${GatewayControllerPath}/config-data`;
const LogoutToLoginPath         = `${GatewayControllerPath}/login-reinit`;
const AppSwitchPath             = `${GatewayControllerPath}/choose-app`;
const GwAuthenticatedPath       = `${GatewayControllerPath}/authenticated`;
const RegisterPath              = `${GatewayControllerPath}/register`;
const DirectPath                = `${GatewayControllerPath}/direct-signin`;
const RegisterSuccessPath       = `${GatewayControllerPath}/register-success`;
const BeameDataStorageRootPath  = path.join(home, process.env.BEAME_DATA_FOLDER || ".beame_data");
const beame_server_folder_name  = process.env.BEAME_SERVER_FOLDER || ".beame_server";
const BeameServerConfigRootPath = path.join(home, beame_server_folder_name);


const ConfigFolder      = "config";
const CredsConfigFolder = "creds";

const AppConfigFileName       = "app_config.json";
const CredsFileName           = "creds.json";
const ProvisionConfigFileName = "provision_settings_config.json";

const CredsFolderPath     = path.join(BeameServerConfigRootPath, CredsConfigFolder);
const CredsJsonPath       = path.join(BeameServerConfigRootPath, CredsConfigFolder, CredsFileName);
const ConfigFolderPath    = path.join(BeameServerConfigRootPath, ConfigFolder);
const AppConfigJsonPath   = path.join(BeameServerConfigRootPath, ConfigFolder, AppConfigFileName);
const ProvisionConfigPath = path.join(BeameServerConfigRootPath, ConfigFolder, ProvisionConfigFileName);

const DEFAULT_LOAD_BALANCER_URL = "https://ioigl3wzx6lajrx6.tl5h1ipgobrdqsj6.v1.p.beameio.net";

const BeameLoginURL = "https://login.beameio.net";

const UniversalLinkUrl = 'https://jv6stw7z6cmh5xdd.tl5h1ipgobrdqsj6.v1.p.beameio.net';

const LoadBalancerURL = process.env.BEAME_LOAD_BALANCER_URL || DEFAULT_LOAD_BALANCER_URL;

const EnvMode = {
	"Gatekeeper":           "Gatekeeper",
	"CentralLogin":         "CentralLogin",
	"DelegatedLoginMaster": "DelegatedLoginMaster",
};

const HtmlEnvMode = {
	"Development": "Dev",
	"Production":  "Prod",
};

/**
 * Registration sources
 * DON'T TOUCH, should by synchronized with backend services
 * @readonly
 * @enum {Number}
 */
const RegistrationSource = {
	"Unknown":        0,
	"NodeJSSDK":      1,
	"InstaSSL":       2,
	"InstaServerSDK": 3,
	"IOSSDK":         4
};

const RequestType = {
	"RequestWithFqdn":       "RequestWithFqdn",
	"RequestWithParentFqdn": "RequestWithParentFqdn",
	"RequestWithAuthServer": "RequestWithAuthServer",
};

const RegistrationMethod = {
	"Pairing": "Pairing",
	"Email":   "Email",
	"SMS":     "SMS",
};

const DelegatedLoginNotificationAction = {
	"Register":   "register",
	"UnRegister": "unregister"
};

const CustomLoginProviders = {
	"Active_Directory": {
		"name": "Active Directory",
		"code": "ad"
	}
};

const CredAction = require('beame-sdk').Config.CredAction;

/**
 * Sns Message Types
 * DON'T TOUCH, should by synchronized with backend services
 * @readonly
 * @enum {Number}
 */
const SnsMessageType = {
	Cert:   1,
	Revoke: 2,
	Delete: 3
};

const CredentialType = {
	ZeroLevel:                "ZeroLevel",
	GatewayServer:            "GatewayServer",
	BeameAuthorizationServer: "BeameAuthorizationServer",
	MatchingServer:           "MatchingServer",
	ExternalMatchingServer:   "ExternalMatchingServer",
	ExternalLoginServer:      "ExternalLoginServer",
	CustomerAuthServer:       "CustomerAuthServer",
	GatekeeperLoginManager:   "GatekeeperLoginManager"
};


const DbProviders = {
	"Couchbase": "couchbase",
	"NeDB":      "NeDB",
	"Sqlite":    "sqlite",
};

const DbSupportedProviders = {
	"NeDB": "NeDB"
};


const SetupServices = {
	"Admin":           {code: "ADMIN"},
	"AdminInvitation": {code: "ADMIN_INVITATION"},
	"MobilePhoto":     {code: "MOBILE_PHOTO"},
	"MobileStream":    {code: "MOBILE_STREAM"},
	"SampleChat":      {code: "SAMPLE_CHAT"},
	"SampleFileShare": {code: "SAMPLE_FILE_SHARE"},
	"RaspberryLight":  {code: "RASPBERRY_LIGHT"}
};

const CookieNames = {
	"Logout":            "beame_logout_url",
	"Logout2Login":      "beame_logout_to_login_url",
	"Login":             "beame_login_url",
	"ClientLogin":       "beame_client_login_url",
	"CentralLogin":      "beame_central_login_url",
	"Service":           "beame_service",
	"RegData":           "beame_reg_data",
	"Proxy":             "proxy_enabling_token",
	"UserInfo":          "beame_userinfo",
	"ClientLoginUrl":    "beame_client_login_url",
	"LoginData":         "usrInData",
	"BeameSettings":     "beame_settings",
	"ProvisionSettings": "beame_prov_settings",
	"ShowZendesk":       "beame_zendesk_settings"
};

module.exports = {
	EnvProfile,
	RequestType,
	RegistrationMethod,
	RegistrationSource,
	EnvMode,
	HtmlEnvMode,
	LoadBalancerURL,
	BeameLoginURL,
	CredentialType,
	CredAction,
	SnsMessageType,
	DelegatedLoginNotificationAction,
	SetupServices,
	DbProviders,
	DbSupportedProviders,
	CustomLoginProviders,
	CookieNames,
	AuthMode: {
		"SESSION":   "Session",
		"PROVISION": "Provision"
	},
	GatewayControllerPath,
	GwAuthenticatedPath,
	SigninPath,
	XprsSigninPath,
	LoginPath,
	LogoutPath,
	ClientLogoutPath,
	ConfigData,
	LogoutToLoginPath,
	AppSwitchPath,
	DCLSOfflinePath,
	RegisterPath,
	DirectPath,
	RegisterSuccessPath,
	UniversalLinkUrl,
	BeameServerConfigRootPath,
	BeameDataStorageRootPath,

	AppConfigFileName,
	CredsFileName,
	ProvisionConfigFileName,

	CredsFolderPath,
	CredsJsonPath,
	ConfigFolderPath,
	AppConfigJsonPath,
	ProvisionConfigPath
};
