/**
 * Created by zenit1 on 09/11/2016.
 */
"use strict";

const path = require('path');
const os   = require('os');
const home = os.homedir();

const Constants   = require('./constants');
const Servers     = Constants.CredentialType;
const db_provider = Constants.DbProviders.Sqlite;

const sqlite_db_name           = "beame_server.db";
const sqlite_db_admin_username = "admin";
const sqlite_env_name          = "production";
const sqlite_db_storage_root   = path.join(home, ".beame_data");

const SqliteConfigTemplate = {
	[sqlite_env_name]: {
		"username":             "",
		"password":             "",
		"storage":              "",
		"database":             "beame_server",
		"host":                 "127.0.0.1",
		"dialect":              "sqlite",
		"autoMigrateOldSchema": true
	}
};


const ConfigProps = {
	Settings: {
		DbProvider: "db_provider"
	},
	Sqlite:   {
		ConfigTemplate: "SqliteConfigTemplate",
		DbName:         "sqlite_db_name",
		AdminUserName:  "sqlite_db_admin_username",
		StorageRoot:    "sqlite_db_storage_root",
		EnvName:        "sqlite_env_name"
	},
	BeameDir: {
		BeameFolderRootPath: "beame_server_folder_path",
		BeameFolderName:     "beame_server_folder_name"
	}
};

const CredsConfigTemplate = {
	[Servers.ZeroLevel]:                   {
		fqdn:   "",
		server: false
	},
	[Servers.GatewayServer]:               {
		fqdn:   "",
		server: true
	},
	[Servers.CustomerAuthorizationServer]: {
		fqdn:   "",
		server: false
	},
	[Servers.BeameAuthorizationServer]:    {
		fqdn:   "",
		server: true
	},
	[Servers.MatchingServer]:              {
		fqdn:   "",
		server: true
	},
	[Servers.AdminServer]:                 {
		fqdn:   "",
		server: true
	},
	[Servers.WhispererServer]:             {
		fqdn:   "",
		server: true
	},
	Users:                                 {}
};

module.exports = {
	ConfigProps,

	CredsConfigTemplate,
	SqliteConfigTemplate,

	db_provider,

	sqlite_db_name,
	sqlite_db_storage_root,
	sqlite_db_admin_username,
	sqlite_env_name
};